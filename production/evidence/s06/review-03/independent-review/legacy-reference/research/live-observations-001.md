# Live observation session 001

Date: 2026-10-02. Primary evidence: actual DOM, accessibility labels, computed styles and displayed browser image. This record is an initial observation, not a complete interaction verification.

## Session identity

- URL supplied by owner: `http://127.0.0.1:50997/shader/0ad74d6b37f94f2794c0d91f60459b2d/`.
- Displayed version: **0.8.272 DEV**.
- Displayed project: `TD-Grape-dev.1.toe`.
- Displayed target: `/project1/PBR_Material_Textured2`.
- Displayed stage/count: Pixel, 82 nodes.
- Browser viewport: 1280 × 720 CSS pixels.
- Observed preferences: English; dark; Cool; standard; UI scale 1.
- Initial graph zoom: 25%. This is a restored view, not a claimed product default.
- Status after load: Graph saved, r896; Uniform live; Material Preview Connected.
- Opening the page automatically connected its preview. No explicit take-control/Apply/save operation was triggered by this inspection.

## Observed shell and component presentation

| Region | Measured or directly displayed evidence | Interpretation boundary |
|---|---|---|
| Product header | 52 px high; brand, subtitle/version, About, language, Import, Export, Save TD project, Apply Shader | The current Host-specific caption is evidence, not authority to move new document storage to Host. |
| Navigation | project name, Host path picker, header/sidebars/Layout controls | New architecture still distinguishes document from target. |
| Left panel | 300 px divider value; Add Node / Sources tabs; search; category tree; source filter; Library | Do not infer internal ownership from this physical arrangement. |
| Canvas | x306/y84, 628 × 604 px; dark dotted field; Vertex/Pixel; Undo/Redo, Box Select, custom names, Link visibility, GLSL | Grid/canvas remains usable space between two independent side regions. |
| Right panels | 340 px divider value; Parameter / OP Parameter, Material Preview, Help; 6 px dividers | Empty Parameter explains selection; Help explains local input value retention. |
| Preview | connected remote panel, displayed source path and 306 × 82 frame-size label in this layout | A visible frame does not independently prove freshness or interaction behavior. |
| Footer | graph-save revision and Uniform live are separate messages; experiments, shortcuts, sharing, appearance, size, fullscreen | Preserve distinctions; do not collapse all success statuses into one. |

Node presentation was read from rendered elements. Current sample cards use #2E2C3A body, #60576E border, 9 px outer radius and a dark drop shadow. Ordinary sampled cards are 190 graph-space pixels wide, while individual source cards can be wider. Titles are 600 weight, 12 px/16 px; their measured 41 px height includes 12 px vertical padding and border. The subgraph sample is 45 px tall due to its content. These are measurements, not a claim that every card must share one fixed height.

At 25% canvas zoom, the observed 11 px port is 2.75 screen pixels. Record model-space dimensions and zoom separately; never reuse screenshot pixels as the logical component metric. Connected outputs in the sample have solid type-colored fill and 2 px type-colored ring. Link navigation arrows and component Split shortcuts are separate controls; some shortcut controls have zero opacity until their relevant state.

## Measured visual roles

The JSON companion preserves exact effective values for the sampled configuration, with legacy variable/selector locators for traceability. Those locators do not prescribe production CSS names.

- Data-type color: scalar #C4C1BC; vec2 #8FC5EE; vec3 #87CEB7; vec4 #C5B2E2; matrix #A1ADB7; sampler #CAB08B.
- Struct token: low-saturation four-stop gradient; no struct instance was present in the sampled card set, so its rendered-port behavior is not verified by this session.
- Node role/title colors: math/functions #43345C; Uniform #2A5E6B; Sampler #6E4C2E; Output #38524A; runtime-info/Vertex Inputs #62414F.
- Selection token #70DC69; the initial sample has no selected node, so selected appearance remains to be observed.
- Accent #B39CFB is distinct from vec4 data color #C5B2E2 and function title color #43345C. These must not be collapsed into one generic purple.
- Text uses several alpha levels over the current background; record alpha and base RGB, not a single flattened screenshot color.

Theme variables describing an unused light configuration are not evidence of effective light-mode appearance. Font-family is the requested CSS stack, not proof that a particular font file rendered every glyph.

## Displayed interaction contracts — not yet exercised

Numeric fields expose this help text: click to edit (touch double-tap), horizontal drag following slider range; Ctrl ×10, Shift ÷10, Ctrl+Shift ÷100; middle mouse / Alt+right mouse / long-press for Value Ladder; choose step vertically and adjust horizontally; release applies, Escape cancels; right-click quick presets. Record these as **UI-advertised** until gesture tests confirm them.

Link navigation advertises click to select/frame all connected nodes and right-click to choose one. Connected-source and node-interface behavior is visible in the DOM, but this session has not changed a link, split components or navigated a nested graph.

Keyboard-shortcuts dialog was opened and read. It states graph shortcuts are inactive during text editing or dialogs. It lists:

- Ctrl+Z / Ctrl+Shift+Z; Ctrl+C/V/D/A; Delete/Backspace.
- Ctrl+arrows for all/upstream/downstream/unconnected selection.
- Ctrl+G frame; Alt+Shift+G move into frame; Alt+G remove from frame; Ctrl+Shift+G selection to subgraph.
- L / Shift+L arrange from sources / outputs.
- Tab add; X Link visibility; P floating Parameter; H all; F selection/all; MMB dolly; Alt+Enter fullscreen; Ctrl+Enter focus canvas; Alt+Up parent.
- Arrows select neighbor, or source/destination of selected connection; Shift+F10/Menu graph actions; Escape cancel/leave focus.
- Enter numeric apply; Escape numeric cancel; Ctrl+Enter notes/GLSL text apply.

These are legacy advertised actions. The new product's accepted domain-separated Undo policy remains authoritative.

## Menus inspected without applying changes

Appearance menu: Simple, Professional, Cool (selected), Excellent, Legendary, Godlike; Dark/Light; brightness slider currently 0. No option changed.

Project/graph menu: Reload editor page, Reload applied graph, Reset browser settings, Import graph, Export graph, Save TD project, Apply Shader. No item executed. This menu alone does not expose a create-test-document action; no conclusion is made about other creation paths.

Language control lists 繁體中文, English, 日本語, Français, 한국어. No language switched. Menu presence is not proof of complete translation coverage.

## Next observation constraints

Owner authorized a separate test graph, then allowed current graph edits but requested a pause to switch graphs. Browser operations are paused at that request. The graph-editing, dynamic-mode, selection, floating-panel, Preview and alternate-language cases remain unverified in this session.

No files were written to the new Grape repository. No production code, prototype tests, architecture data or implementation-state was changed. The only UI operations after opening this page were opening/closing appearance and shortcut dialogs and opening the graph-action menu.

## CANVAS-005 correction (2026-10-03)

The earlier shortcut summary “Escape cancel/leave focus” is not a valid current Focus graph exit contract. Source, explicit fullscreen-shortcut test intent, and [CL-03](canvas-live-005.md) agree Escape retains Focus graph. Toggle Focus graph or Ctrl/Cmd+Enter to exit. Original record retained as evidence history, not silently erased.
