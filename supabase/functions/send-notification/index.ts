import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'job_complete' | 'job_failed' | 'test' | 'collaboration_invite';
  jobId?: string;
  userId?: string;
  email?: string;
  jobDetails?: {
    artStyle: string;
    completedPanels: number;
    totalPanels: number;
    failedPanels: number;
    projectTitle?: string;
  };
  inviteDetails?: {
    projectTitle: string;
    inviterEmail: string;
    role: string;
    inviteLink: string;
  };
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Comic Generator <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  return res.json();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, jobId, userId, email, jobDetails }: NotificationRequest = await req.json();
    console.log("Notification request:", { type, jobId, userId });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let recipientEmail = email;

    if (!recipientEmail && userId) {
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("notification_email, email_notifications")
        .eq("user_id", userId)
        .maybeSingle();

      if (prefs?.notification_email) {
        recipientEmail = prefs.notification_email;
      } else {
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        recipientEmail = authUser?.user?.email;
      }
    }

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "No email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let subject: string;
    let html: string;
    const { inviteDetails } = await req.json().catch(() => ({})) as NotificationRequest;

    if (type === "test") {
      subject = "🎨 Comic Generator - Test Notification";
      html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #7c3aed;">✅ Test Notification</h1><p>Your email notifications are working correctly!</p></div>`;
    } else if (type === "collaboration_invite" && inviteDetails) {
      subject = `🎨 You've been invited to collaborate on "${inviteDetails.projectTitle}"`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed;">You're Invited!</h1>
          <p><strong>${inviteDetails.inviterEmail}</strong> has invited you to collaborate on their comic project.</p>
          <p><strong>Project:</strong> ${inviteDetails.projectTitle}</p>
          <p><strong>Your Role:</strong> ${inviteDetails.role}</p>
          <a href="${inviteDetails.inviteLink}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
            View Project
          </a>
          <p style="color: #666; margin-top: 24px; font-size: 14px;">
            If you don't have an account, you'll need to sign up first.
          </p>
        </div>
      `;
    } else if (type === "job_complete") {
      const d = jobDetails || { artStyle: "Unknown", completedPanels: 0, totalPanels: 0 };
      subject = `🎉 Your Comic is Ready!`;
      html = `<div style="font-family: sans-serif; padding: 20px;"><h1 style="color: #10b981;">🎉 Comic Generation Complete!</h1><p>${d.completedPanels}/${d.totalPanels} panels generated in ${d.artStyle} style.</p></div>`;
    } else {
      const d = jobDetails || { failedPanels: 0, totalPanels: 0 };
      subject = `⚠️ Comic Generation Issue`;
      html = `<div style="font-family: sans-serif; padding: 20px;"><h1 style="color: #ef4444;">⚠️ Generation Issue</h1><p>${d.failedPanels} panels failed. You can retry from the Queue panel.</p></div>`;
    }

    const emailResponse = await sendEmail(recipientEmail, subject, html);
    console.log("Email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
