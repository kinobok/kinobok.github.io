# Implementation Plan: Cinema Schedule URL Mapping

## Phase 1: Data Preparation & Subagent Orchestration
- [ ] Task: Coordinate Extraction
    - [ ] Create a temporary script or use a subagent to parse `docs/cinema_list.txt` and match names against the `cinemas` array in `frontend/public/data.json`.
    - [ ] Generate an intermediate JSON list containing `{"name": "...", "lat": ..., "lng": ...}`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Data Preparation & Subagent Orchestration' (Protocol in workflow.md)

## Phase 2: URL Discovery (Major Chains)
- [ ] Task: Construct URLs for Chains
    - [ ] Implement logic to automatically generate schedule URLs for "Cinema City", "Multikino", and "Helios" based on their known URL structures and the cinema names.
    - [ ] Append these URLs to the intermediate JSON list for the matched chain cinemas.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: URL Discovery (Major Chains)' (Protocol in workflow.md)

## Phase 3: URL Discovery (Independent Cinemas)
- [ ] Task: Independent Cinema Web Search
    - [ ] Utilize the `google_web_search` tool (or a dedicated investigation subagent) to find the official schedule ("repertuar") page for each remaining independent cinema.
    - [ ] If a URL cannot be found reliably, pause and use the `ask_user` tool to request manual input from the user.
    - [ ] Append the discovered URLs to the intermediate JSON list.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: URL Discovery (Independent Cinemas)' (Protocol in workflow.md)

## Phase 4: Final Output Generation
- [ ] Task: Format and Save JSON
    - [ ] Format the aggregated data into the final Array of Objects schema: `[{"name": "...", "url": "...", "lat": ..., "lng": ...}]`.
    - [ ] Write the formatted output to `docs/cinema_urls.json`.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Output Generation' (Protocol in workflow.md)