<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- AI calls live in src/lib/ai/*.server.ts and are exposed via createServerFn in src/lib/*.functions.ts — keeps the API key server-side.
- Keep the impact simulator and sourced destination directory in separate browser-safe components; isolate mass-balance calculations in a tested pure module so illustrative projections stay distinct from measured scan activity.
