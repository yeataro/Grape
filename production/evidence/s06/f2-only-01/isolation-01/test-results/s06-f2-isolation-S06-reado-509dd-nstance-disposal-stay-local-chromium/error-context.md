# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-f2-isolation.spec.ts >> S06 readonly owner fault registration serialization invalidation and multi-instance disposal stay local
- Location: ..\..\..\production\tests\browser\s06-f2-isolation.spec.ts:97:1

# Error details

```
Error: expect(received).toMatchObject(expected)

- Expected  - 3
+ Received  + 3

  Object {
    "alive": true,
    "before": 0,
    "events": 1,
-   "fresh": true,
+   "fresh": false,
    "guardBlocked": true,
    "noStale": true,
-   "normal": true,
+   "normal": false,
    "refreshClosed": true,
    "serialBlocked": true,
-   "unavailable": true,
+   "unavailable": false,
  }
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - text: Grape
      - generic [ref=e9]: SHADER WORKSPACE
      - generic "No candidate identity injected" [ref=e10]: Development · unversioned
      - button "本輪更新" [ref=e11] [cursor=pointer]
    - navigation "Document actions" [ref=e12]:
      - button "Save" [ref=e13] [cursor=pointer]
      - button "Generate GLSL" [ref=e16] [cursor=pointer]
    - generic [ref=e19]:
      - generic [ref=e20]: Unsaved changes
      - generic [ref=e21]: Host-free
  - generic [ref=e23]:
    - button "Undo" [disabled] [ref=e24]
    - button "Redo" [disabled] [ref=e27]
    - button "Delete selected" [ref=e30] [cursor=pointer]
    - alert
  - main [ref=e31]:
    - generic [ref=e33]:
      - generic: Canvas 1
      - generic "Shader graph canvas" [ref=e34]:
        - group "Image output" [ref=e35]:
          - heading "Image output" [level=3] [ref=e36]
          - generic [ref=e37]:
            - button "Image output input color" [ref=e38] [cursor=pointer]
            - generic [ref=e39]: color
            - generic [ref=e40]: vec4
        - generic:
          - button "Untitled shader / pixel" [disabled]
        - generic [ref=e41]:
          - button "New subgraph" [ref=e42] [cursor=pointer]
          - button "Library subgraph" [ref=e43] [cursor=pointer]
          - button "Encapsulate" [ref=e44] [cursor=pointer]
          - button "Make independent" [ref=e45] [cursor=pointer]
          - button "Enter subgraph" [ref=e46] [cursor=pointer]
          - button "Arrange nodes" [ref=e47] [cursor=pointer]
          - button "Frame selection" [ref=e48] [cursor=pointer]
          - group [ref=e49]:
            - generic "Local clipboard" [ref=e50] [cursor=pointer]
          - group [ref=e51]:
            - generic "Structures" [ref=e52] [cursor=pointer]
            - option "New structure" [selected]
        - generic [ref=e53]:
          - button "Vertex" [ref=e54] [cursor=pointer]
          - button "Pixel" [pressed] [ref=e55] [cursor=pointer]
        - generic [ref=e56]:
          - button "Add Node" [ref=e57] [cursor=pointer]
          - button "Browse nodes" [ref=e60] [cursor=pointer]
          - button "Up" [disabled] [ref=e63]
          - button "Shortcuts" [ref=e66] [cursor=pointer]
    - complementary [ref=e69]:
      - generic [ref=e70]:
        - heading "Inspector" [level=2] [ref=e71]
        - paragraph [ref=e72]: Select a node to inspect its parameters.
  - contentinfo [ref=e73]:
    - button "Project actions" [ref=e74] [cursor=pointer]
    - status [ref=e75]:
      - button "Read full application status" [disabled] [ref=e76]
    - button "Shader output" [ref=e77] [cursor=pointer]
    - button "Hints" [ref=e78] [cursor=pointer]
```

# Test source

```ts
  157 |                     name: "serial",
  158 |                     identity: "same-id",
  159 |                     state: "test",
  160 |                     data: {
  161 |                       toJSON() {
  162 |                         invalidateHover(root);
  163 |                         return {};
  164 |                       },
  165 |                     },
  166 |                   };
  167 |                 return {
  168 |                   kind: "Node",
  169 |                   name: data.name,
  170 |                   identity: "same-id",
  171 |                   state: "readonly fixture",
  172 |                   data,
  173 |                 };
  174 |               });
  175 |             },
  176 |           };
  177 |         },
  178 |       },
  179 |       {
  180 |         locale: "en",
  181 |         subscribe: () => () => {},
  182 |         resolve: (r: any) => ({ text: r.fallback }),
  183 |       },
  184 |     );
  185 |     session.mount({ protocol: "grape.dom.v1", target: root });
  186 |     const button = () => root.querySelector("button")!,
  187 |       press = () => {
  188 |         button().focus();
  189 |         button().dispatchEvent(
  190 |           new KeyboardEvent("keydown", {
  191 |             key: "F2",
  192 |             bubbles: true,
  193 |             cancelable: true,
  194 |           }),
  195 |         );
  196 |       },
  197 |       opened = () => !!root.querySelector("dialog[open]");
  198 |     for (let i = 0; i < 80; i++) {
  199 |       button().dispatchEvent(
  200 |         new PointerEvent("pointerover", { bubbles: true }),
  201 |       );
  202 |       button().dispatchEvent(
  203 |         new PointerEvent("pointermove", { bubbles: true }),
  204 |       );
  205 |     }
  206 |     button().focus();
  207 |     const before = reads;
  208 |     press();
  209 |     const normal = opened();
  210 |     helper.invalidate();
  211 |     mode = "read";
  212 |     press();
  213 |     const unavailable = root.textContent!.includes("Unavailable");
  214 |     helper.invalidate();
  215 |     mode = "guard";
  216 |     press();
  217 |     const guardBlocked = !opened();
  218 |     mode = "serial";
  219 |     press();
  220 |     const serialBlocked = !opened();
  221 |     mode = "normal";
  222 |     press();
  223 |     data = { name: "second" };
  224 |     notify();
  225 |     const refreshClosed = !opened();
  226 |     press();
  227 |     const fresh = root.textContent!.includes("second");
  228 |     helper.invalidate();
  229 |     session.unmount();
  230 |     late();
  231 |     session.mount({ protocol: "grape.dom.v1", target: root });
  232 |     press();
  233 |     const noStale = !root.textContent!.includes("STALE");
  234 |     helper.dispose();
  235 |     button().click();
  236 |     notify();
  237 |     const alive = session.status === "mounted" && events === 1;
  238 |     session.dispose();
  239 |     late();
  240 |     helper2.dispose();
  241 |     root.remove();
  242 |     root2.remove();
  243 |     return {
  244 |       before,
  245 |       normal,
  246 |       unavailable,
  247 |       guardBlocked,
  248 |       serialBlocked,
  249 |       refreshClosed,
  250 |       fresh,
  251 |       noStale,
  252 |       alive,
  253 |       reads,
  254 |       events,
  255 |     };
  256 |   });
> 257 |   expect(result).toMatchObject({
      |                  ^ Error: expect(received).toMatchObject(expected)
  258 |     before: 0,
  259 |     normal: true,
  260 |     unavailable: true,
  261 |     guardBlocked: true,
  262 |     serialBlocked: true,
  263 |     refreshClosed: true,
  264 |     fresh: true,
  265 |     noStale: true,
  266 |     alive: true,
  267 |     events: 1,
  268 |   });
  269 |   fs.writeFileSync(
  270 |     path.join(out, "owner-faults.json"),
  271 |     JSON.stringify(
  272 |       {
  273 |         result,
  274 |         method:
  275 |           "Synthetic public PresentationSession/mount owner fixtures, fault injection and lifecycle. Not physical pointer/IME evidence.",
  276 |       },
  277 |       null,
  278 |       2,
  279 |     ),
  280 |   );
  281 | });
  282 | 
```