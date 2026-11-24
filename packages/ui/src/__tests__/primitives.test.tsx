import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  Button,
  FormField,
  Badge,
  Alert,
  CommandPalette,
  DropdownMenu,
  ToastStack,
  Drawer,
  Accordion,
} from "../index";

describe("@antigravity/ui primitives", () => {
  it("renders Button with accessible role and default type='button'", () => {
    const { getByRole } = render(<Button>Publish Token</Button>);
    const btn = getByRole("button", { name: "Publish Token" });
    expect(btn).toBeTruthy();
    expect(btn.getAttribute("type")).toBe("button");
  });

  it("wires FormField label, aria-invalid, and aria-describedby cleanly", () => {
    const { getByLabelText, getByText } = render(
      <FormField
        label="Seed Hue"
        helperText="Enter a value between 0 and 360"
        errorText="Hue must be numeric"
        required
      />
    );
    const input = getByLabelText(/Seed Hue/i);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-required")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain("-helper");
    expect(input.getAttribute("aria-describedby")).toContain("-error");
    expect(getByText("Hue must be numeric").getAttribute("aria-live")).toBe("polite");
  });

  it("renders Badge and Alert with semantic ARIA roles", () => {
    const { getByText, getByRole } = render(
      <>
        <Badge tone="success">AAA Pass</Badge>
        <Alert tone="error" title="Validation Failed">
          Contrast ratio below 4.5:1
        </Alert>
      </>
    );
    expect(getByText("AAA Pass")).toBeTruthy();
    expect(getByRole("alert").textContent).toContain("Contrast ratio below 4.5:1");
  });

  it("renders v3.0 CommandPalette, DropdownMenu, ToastStack, Drawer, and Accordion with ARIA roles", () => {
    const { getByRole, getByText } = render(
      <>
        <CommandPalette
          open={true}
          onOpenChange={() => {}}
          items={[{ id: "export", label: "Export Tokens", shortcut: "⌘E", onSelect: () => {} }]}
        />
        <DropdownMenu
          triggerLabel="Actions"
          items={[{ id: "copy", label: "Copy CSS", onSelect: () => {} }]}
        />
        <ToastStack
          toasts={[{ id: "t1", title: "Tokens Compiled", tone: "success", timestamp: "08:00" }]}
          onDismiss={() => {}}
        />
        <Drawer open={true} onOpenChange={() => {}} title="Token Inspector">
          <p>Drawer body</p>
        </Drawer>
        <Accordion
          defaultOpenId="a1"
          items={[{ id: "a1", title: "OKLCH Math", content: "Locked lightness curve." }]}
        />
      </>
    );
    expect(getByText("Export Tokens")).toBeTruthy();
    expect(getByRole("button", { name: "Actions" })).toBeTruthy();
    expect(getByRole("status").textContent).toContain("Tokens Compiled");
    expect(getByText("Token Inspector")).toBeTruthy();
    expect(getByText("Locked lightness curve.")).toBeTruthy();
  });
});
