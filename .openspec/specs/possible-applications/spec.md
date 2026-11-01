# Sentia Possible Applications

Status: active for wo-gh-15
Slug: possible-applications

## Roles
- implementer: builds the change described here
- reviewer: checks the change against this spec
- qa: checks the scenarios below with tests
- product_owner: owns the purpose and accepts the result

## Purpose
Edu saw coverage of glucose responsive insulin research and of living cell implants that sense glucose and respond, and ordered the Sentia site to name glucose monitoring support for people with diabetes as a possible application of the Sentia platform. Sentia Patch One is a concept sensing patch: it senses, relays, and alerts. This spec governs adding a possible applications area to the home page that carries that application at the same weight as the others, framed strictly as possible and future. Nothing in this order deploys; the result stops at the owner gate.

## Requirements
- R1: The home page gains one new section, a possible applications area, in the established design system of design/DESIGN.md: a numbered mono kicker in the established style, a section title, a short introduction, and a hairline divided grid of application entries. Placed after the FAQ section at the end of main, its kicker reads "08 / Possible applications". The section is typographic: it carries no imagery at all, new or reused.
- R2: The change is a pure insertion. No existing line of any production file is modified or deleted: the header, the nav, every existing section, the footer and every route stay byte identical to the base tree. The footer keeps, byte exact, both "Wellness monitoring, not diagnosis. Sentia Patch One is not a medical device." and "Sentia is a concept product, designed and built end to end by ANVIL, an open source software factory. Developed by Eduardo Arana."
- R3: The introduction states the platform pattern only: a patch that senses, relays what it senses, and alerts the wearer and a care circle they choose. It frames the whole section as exploration: where that pattern could go, not what the product does today.
- R4: The grid names four application entries at equal weight, each with a title and two or three sentences of body copy: (1) everyday wellness trends, (2) a care circle around someone living alone, (3) activity and recovery patterns, (4) glucose monitoring support for people living with diabetes. No entry is visually or verbally privileged over the others: same grid treatment, comparable length, no badges, no calls to action.
- R5: Wording is exploratory throughout the new section: possible, could, one day, future, explores, would. The diabetes entry must carry at least two such exploratory markers in its own copy, and its title or lead must frame it as a possible future application.
- R6: HARD GUARDRAIL, capability: the new content never claims or implies that the patch detects, measures, monitors or senses glucose today, in any tense or construction that reads as a present capability of the product. Naming the possible application itself (glucose monitoring as the name of the future application) is allowed only inside the exploratory framing of R5.
- R7: HARD GUARDRAIL, medicine: the new content contains no mention of insulin, of releasing or delivering any substance, of treatment, therapy, dosing or diagnosis, and no efficacy claim or medical outcome claim of any kind. Nothing in the section implies a medical device in clinical use.
- R8: The rest of the site is untouched: no changes to facts, sensors, specs, FAQ answers, the demo, the dashboard, the MCP surface, llms outputs or any route. New files are limited to the tests for this spec, the run evidence under evidence/possible-applications/, and the run records the line itself produces.
- R9: Production shape evidence, binding: (1) the real production bundle command succeeds on the final tree with zero local patches, command and exit status recorded; (2) the bundled output is served by a local Worker runtime and a headless browser pass records zero console errors and zero page errors on the home page; (3) before and after screenshots of the affected area (the end of main and the footer region) are committed under evidence/possible-applications/, the before capture taken from the base build and the after capture from the final build, both at desktop width.
- R10: Deployment is not part of this order. The deployer station stays a packet; nothing is deployed from this branch, and production keeps serving its current version.

## Scenarios

### Scenario: The section exists and names four applications at equal weight
- S1: Given the final tree, when the home page is served, then it contains one section with id "applications" whose grid names all four entries of R4, the diabetes entry among them, each with a title and body copy of comparable length and identical grid treatment.

### Scenario: The diabetes application is framed as possible and future
- S2: Given the new section, when its diabetes entry is read, then the entry carries at least two exploratory markers from R5 and frames glucose monitoring as a possible future application of the platform pattern (continuous sensing, relay, alerts to the wearer and their circle), and nothing more.

### Scenario: No present capability claim for glucose
- S3: Given the new section text, when it is scanned, then no sentence states or implies that the patch detects, measures, monitors or senses glucose as a present capability; an automated test asserts the absence of capability claim shapes (for example "detects glucose", "measures glucose", "monitors glucose", "senses glucose", "glucose sensor") in the new section.

### Scenario: No treatment or outcome language
- S4: Given the new section text, when it is scanned, then the words insulin, treat and its derivatives, therapy, dose and its derivatives, diagnos and its derivatives, cure and manage your condition shapes are all absent, and an automated test asserts each absence; the section makes no efficacy or medical outcome claim.

### Scenario: Everything outside the section is byte stable
- S5: Given the production diff against the base tree, when it is read, then the only production change is the inserted section block in src/page.js; the footer disclosure sentences of R2 are byte exact; the header, nav, existing sections, routes, image payloads and llms outputs are unchanged.

### Scenario: Production shape holds
- S6: Given the final tree, when the bundle is built with no local patches and the bundled output is served locally, then the bundle command exits clean, the headless browser pass on the home page records zero console errors and zero page errors, and the before and after screenshots of R9 are committed under evidence/possible-applications/.

### Scenario: Green suite, full review panel, no deployment
- S7: Given the executed run, when the run report is read, then the project test suite passes apart from the design v4 S11 failure, itemized by name as pre-existing on this stack and left untouched; reviewer-design has judged the rendered section against DESIGN.md and the guardrails R5 to R7; and no deployment step ran, with production still serving its previous version.
