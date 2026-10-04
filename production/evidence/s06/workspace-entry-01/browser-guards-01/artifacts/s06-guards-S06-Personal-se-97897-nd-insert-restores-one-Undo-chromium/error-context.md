# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-guards.spec.ts >> S06 Personal search and inspect are readonly, malformed import survives unrelated success, and insert restores one Undo
- Location: ..\..\..\production\tests\browser\s06-guards.spec.ts:20:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Enable editing', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - text: Grape
      - generic [ref=e9]: SHADER WORKSPACE
    - navigation "Document actions" [ref=e10]:
      - generic [ref=e11]:
        - button "New document" [ref=e12] [cursor=pointer]
        - button "Save" [ref=e15] [cursor=pointer]
        - button "Open saved" [ref=e18] [cursor=pointer]
        - button "Export JSON" [active] [ref=e21] [cursor=pointer]
        - button "Export PNG" [ref=e24] [cursor=pointer]
        - button "Open file" [ref=e27] [cursor=pointer]
      - generic [ref=e30]:
        - button "Generate GLSL" [ref=e31] [cursor=pointer]
        - button "Second Canvas" [ref=e34] [cursor=pointer]
        - button "Lock editing" [pressed] [ref=e37] [cursor=pointer]
      - group [ref=e40]:
        - generic "More actions" [ref=e41] [cursor=pointer]
        - generic [ref=e44]:
          - button "Upgrade subgraph owners" [ref=e45] [cursor=pointer]
          - button "Personal Library" [ref=e46] [cursor=pointer]
    - generic [ref=e47]:
      - generic [ref=e48]: Unsaved changes
      - generic [ref=e49]: Host-free
  - alert [ref=e50]: PERSONAL_FORMAT
  - generic [ref=e52]:
    - button "Undo" [disabled] [ref=e53]
    - button "Redo" [disabled] [ref=e56]
    - button "Delete selected" [disabled] [ref=e59]
    - alert
  - main [ref=e60]:
    - generic [ref=e62]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e63]:
        - generic:
          - generic:
            - group "Image output" [ref=e64]:
              - heading "Image output" [level=3] [ref=e65]
              - generic [ref=e66]:
                - button "Image output input color" [ref=e67] [cursor=pointer]:
                  - generic [ref=e69]: color
                - generic [ref=e70]: vec4
            - group "Subgraph" [ref=e71]:
              - heading "Subgraph" [level=3] [ref=e72]
              - generic [ref=e73]:
                - button "Subgraph input Value" [ref=e74] [cursor=pointer]:
                  - generic [ref=e76]: Value
                - generic [ref=e77]: vec4
              - generic [ref=e78]:
                - button "Subgraph output Value" [ref=e79] [cursor=pointer]:
                  - generic [ref=e80]: Value
                - generic [ref=e82]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e83]:
          - button "New subgraph" [ref=e84] [cursor=pointer]
          - button "Library subgraph" [ref=e85] [cursor=pointer]
          - button "Encapsulate" [ref=e86] [cursor=pointer]
          - button "Make independent" [ref=e87] [cursor=pointer]
          - button "Enter subgraph" [ref=e88] [cursor=pointer]
          - button "Arrange nodes" [ref=e89] [cursor=pointer]
          - button "Frame selection" [ref=e90] [cursor=pointer]
          - group [ref=e91]:
            - generic "Local clipboard" [ref=e92] [cursor=pointer]
          - group [ref=e93]:
            - generic "Structures" [ref=e94] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e95]:
          - button "Vertex" [ref=e96] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e97] [cursor=pointer]
        - generic [ref=e98]:
          - button "Add Node" [disabled] [ref=e99]
          - button "Browse nodes" [ref=e102] [cursor=pointer]
          - button "Up" [disabled] [ref=e105]
          - button "Shortcuts" [ref=e108] [cursor=pointer]
    - complementary [ref=e111]:
      - generic [ref=e112]:
        - heading "Inspector" [level=2] [ref=e113]
        - paragraph [ref=e114]: Subgraph
        - button "Rename node" [ref=e115] [cursor=pointer]
        - generic [ref=e118]:
          - generic [ref=e119]: Value
          - textbox "Value" [ref=e120]: "[1,1,1,1]"
          - alert
  - generic [ref=e122]:
    - heading "Shader output" [level=2] [ref=e123]
    - paragraph [ref=e124]: Generate to inspect shader output.
    - generic "Generated GLSL"
    - list "Diagnostics" [ref=e125]:
      - listitem [ref=e126]:
        - text: "INPUT_REQUIRED: Connect the required input."
        - button "Locate node" [ref=e127] [cursor=pointer]
  - contentinfo [ref=e128]:
    - generic [ref=e129]: Click an output port, then an input to connect. Shift-click replaces a connection.
    - generic [ref=e130]: Scroll to zoom · Drag empty space to pan
```

# Test source

```ts
  1  | import type { Page } from "@playwright/test";
  2  | 
  3  | /** Follow the same responsive menu path as a user; never force a hidden control. */
  4  | export async function clickAction(page: Page, name: string) {
  5  |   const button = page.getByRole("button", { name, exact: true });
  6  |   if (!(await button.isVisible())) {
  7  |     const menu = page.locator(".action-overflow");
  8  |     if (await menu.isVisible() && !(await menu.evaluate((e) => (e as HTMLDetailsElement).open)))
  9  |       await menu.locator("summary").click();
  10 |   }
> 11 |   await button.click();
     |                ^ Error: locator.click: Test timeout of 30000ms exceeded.
  12 | }
  13 | 
```