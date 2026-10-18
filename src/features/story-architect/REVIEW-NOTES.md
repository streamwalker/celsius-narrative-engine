# Review additions

The author-approved state now applies to specific world-entry content. Editing a name, category, description, rule, cost, or exception returns an approved entry to draft. A status-only approval decision is preserved. Eight additional unit cases cover invalidation, explicit approval, unchanged content, additions, removals, and story-only edits.

The application header no longer displays hard-coded numbers of online writers, indexed scripts, or generated panels as though they were live activity. It uses a static workspace heading instead. This is a small additional change to existing application code beyond the route/sidebar integration described in the initial README.

The primary review implementation remains `/story-architect`: browser-local, project-scoped, and separate from the original Narrative Engine's working draft. The legacy engine's backup code, AI endpoints, cloud schema, and scene editor have not been replaced by this pull request. A separately tested deeper integration prototype is not part of this branch.

GitHub Actions checks application TypeScript, runs the complete test suite, builds production assets, and creates a short-lived source archive for review. The archive excludes `.env` files, Git metadata, dependency directories, and compiled assets. It is not a deployment.
