# Implementation Plan: Cinema Schedule URL Mapping

## Phase 1: Data Preparation & Subagent Orchestration
- [x] Task: Coordinate Extraction
    - [x] Create a temporary script or use a subagent to parse `docs/cinema_list.txt` and match names against the `cinemas` array in `frontend/public/data.json`.
    - [x] Generate an intermediate JSON list containing `{"name": "...", "lat": ..., "lng": ...}`.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Data Preparation & Subagent Orchestration' (Protocol in workflow.md)

## Phase 2: URL Discovery (Major Chains)
- [x] Task: Construct URLs for Chains
    - [x] Implement logic to automatically generate schedule URLs for "Cinema City", "Multikino", and "Helios" based on their known URL structures and the cinema names.
    - [x] Append these URLs to the intermediate JSON list for the matched chain cinemas.
- [x] Task: Conductor - User Manual Verification 'Phase 2: URL Discovery (Major Chains)' (Protocol in workflow.md)

## Phase 3: URL Discovery (Independent Cinemas)
- [x] Task: Independent Cinema Web Search
    - [x] Utilize the `google_web_search` tool (or a dedicated investigation subagent) to find the official schedule ("repertuar") page for each remaining independent cinema.
    - [x] If a URL cannot be found reliably, pause and use the `ask_user` tool to request manual input from the user.
    - [x] Append the discovered URLs to the intermediate JSON list.
- [x] Task: Conductor - User Manual Verification 'Phase 3: URL Discovery (Independent Cinemas)' (Protocol in workflow.md)

## Phase 4: Final Output Generation
- [x] Task: Format and Save JSON
    - [x] Format the aggregated data into the final Array of Objects schema: `[{"name": "...", "url": "...", "lat": ..., "lng": ...}]`.
    - [x] Write the formatted output to `docs/cinema_urls.json`.
- [x] Task: Conductor - User Manual Verification 'Phase 4: Final Output Generation' (Protocol in workflow.md)