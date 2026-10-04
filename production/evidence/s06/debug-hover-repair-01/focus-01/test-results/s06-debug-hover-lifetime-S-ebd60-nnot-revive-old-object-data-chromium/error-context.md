# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: s06-debug-hover-lifetime.spec.ts >> S06 diagnostic mount revoke hide move update and late callback cannot revive old object data
- Location: ..\..\..\production\tests\browser\s06-debug-hover-lifetime.spec.ts:5:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('dialog', { name: 'Object information', exact: true })
Timeout: 5000ms
- Expected substring  - 1
+ Received string     + 8

- "old"
+ Object informationUI control: New subgraph
+ Identity: 未提供
+ State: UI-only · available
+
+ {
+   "modelData": "未提供",
+   "role": "button"
+ }Close object details

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Object information', exact: true })
    14 × locator resolved to <dialog open="" data-kind="modal" aria-label="Object information" class="floating-surface hover-details">…</dialog>
       - unexpected value "Object informationUI control: New subgraph
Identity: 未提供
State: UI-only · available

{
  "modelData": "未提供",
  "role": "button"
}Close object details"

```

```yaml
- dialog "Object information":
  - heading "Object information" [level=2]
  - region "Current object data": "UI control: New subgraph Identity: 未提供 State: UI-only · available { \"modelData\": \"未提供\", \"role\": \"button\" }"
  - button "Close object details"
```

# Test source

```ts
  13  |     })
  14  |     .check();
  15  |   await page.keyboard.press("Escape");
  16  |   await page.evaluate(async () => {
  17  |     const url = "/src/ui/mount.ts",
  18  |       { PresentationSession } = await import(url);
  19  |     const surface = document.createElement("section");
  20  |     surface.id = "hover-lifetime-fixture";
  21  |     document.querySelector("main")!.append(surface);
  22  |     let value = "old",
  23  |       sequence = 0,
  24  |       update: () => void = () => {},
  25  |       oldScope: any,
  26  |       ticket: any,
  27  |       stale: any;
  28  |     const view = {
  29  |       kind: "panel",
  30  |       capture: () => ({ value }),
  31  |       subscribe: (f: () => void) => {
  32  |         update = f;
  33  |         return () => {};
  34  |       },
  35  |       dispose: () => {},
  36  |       mount: (m: any) => {
  37  |         const node = document.createElement("button");
  38  |         node.textContent = "Lifetime target";
  39  |         node.dataset.mount = String(++sequence);
  40  |         m.surface.target.append(node);
  41  |         m.scope.own(() => node.remove());
  42  |         const hover = m.hover(node);
  43  |         oldScope ??= m.scope;
  44  | 
  45  |         return {
  46  |           update: (p: any) => {
  47  |             hover.set(node, () => ({
  48  |               kind: "Node",
  49  |               name: "Lifetime target",
  50  |               identity: "same-persistent-id",
  51  |               state: "UI-only fixture",
  52  |               data: { value: p.value },
  53  |             }));
  54  |             stale ??= () =>
  55  |               hover.set(node, () => ({
  56  |                 kind: "Node",
  57  |                 name: "STALE",
  58  |                 identity: "same-persistent-id",
  59  |                 state: "revoked",
  60  |               }));
  61  |           },
  62  |         };
  63  |       },
  64  |     };
  65  |     const session = new PresentationSession(view, {
  66  |       locale: "en",
  67  |       subscribe: () => () => {},
  68  |       resolve: (ref: any) => ({ text: ref.fallback }),
  69  |     });
  70  |     session.mount({ protocol: "grape.dom.v1", target: surface });
  71  |     ticket = oldScope.ticket();
  72  |     (window as any).__hoverLifetime = {
  73  |       session,
  74  |       surface,
  75  |       initiallyAccepts: () => oldScope.accept(ticket, () => {}),
  76  |       rearm: () => {
  77  |         ticket = oldScope.ticket();
  78  |         return oldScope.accept(ticket, () => {});
  79  |       },
  80  |       change: () => {
  81  |         value = "current";
  82  |         update();
  83  |       },
  84  |       late: () =>
  85  |         oldScope.accept(ticket, () => {
  86  |           stale();
  87  |         }),
  88  |       stale: () => stale(),
  89  |       move: () => {
  90  |         session.unmount();
  91  |         document.querySelector("#code")!.append(surface);
  92  |         session.mount({ protocol: "grape.dom.v1", target: surface });
  93  |       },
  94  |     };
  95  |   });
  96  |   const target = page.getByRole("button", {
  97  |       name: "Lifetime target",
  98  |       exact: true,
  99  |     }),
  100 |     details = page.getByRole("dialog", {
  101 |       name: "Object information",
  102 |       exact: true,
  103 |     });
  104 |   expect(
  105 |     await page.evaluate(() =>
  106 |       (window as any).__hoverLifetime.initiallyAccepts(),
  107 |     ),
  108 |   ).toBe(true);
  109 |   await target.hover();
  110 |   await page
  111 |     .getByRole("button", { name: "Read object details", exact: true })
  112 |     .click();
> 113 |   await expect(details).toContainText('"old"');
      |                         ^ Error: expect(locator).toContainText(expected) failed
  114 |   await page.evaluate(() => (window as any).__hoverLifetime.change());
  115 |   await expect(details).not.toBeVisible();
  116 |   expect(
  117 |     await page.evaluate(() => (window as any).__hoverLifetime.late()),
  118 |   ).toBe(false);
  119 |   expect(
  120 |     await page.evaluate(() => (window as any).__hoverLifetime.rearm()),
  121 |   ).toBe(true);
  122 |   await page.mouse.move(1, 1);
  123 |   await target.hover();
  124 |   await page
  125 |     .getByRole("button", { name: "Read object details", exact: true })
  126 |     .click();
  127 |   await expect(details).toContainText('"current"');
  128 |   await page.evaluate(() => {
  129 |     (window as any).__hoverLifetime.surface.hidden = true;
  130 |   });
  131 |   await expect(details).not.toBeVisible();
  132 |   await page.evaluate(() => {
  133 |     (window as any).__hoverLifetime.surface.hidden = false;
  134 |     (window as any).__hoverLifetime.move();
  135 |   });
  136 |   await expect(target).toHaveAttribute("data-mount", "2");
  137 |   expect(
  138 |     await page.evaluate(() => (window as any).__hoverLifetime.late()),
  139 |   ).toBe(false);
  140 |   await page.evaluate(() => (window as any).__hoverLifetime.stale());
  141 |   await target.hover();
  142 |   await page
  143 |     .getByRole("button", { name: "Read object details", exact: true })
  144 |     .click();
  145 |   await expect(details).toContainText('"current"');
  146 |   await expect(details).not.toContainText("STALE");
  147 |   await page.evaluate(() => (window as any).__hoverLifetime.session.dispose());
  148 |   await expect(details).not.toBeVisible();
  149 |   await expect(target).toHaveCount(0);
  150 |   fs.writeFileSync(
  151 |     path.join(process.env.GRAPE_EVIDENCE_DIR!, "mount-lifetime.json"),
  152 |     JSON.stringify(
  153 |       {
  154 |         status: "PASS",
  155 |         method:
  156 |           "Isolated public PresentationSession and optional hover binding fixture; synthetic hide/move/update/dispose and late callback. Same persistent ID, new mount. No private model/controller access.",
  157 |         lateAccepted: false,
  158 |       },
  159 |       null,
  160 |       2,
  161 |     ) + "\n",
  162 |   );
  163 | });
  164 | 
```