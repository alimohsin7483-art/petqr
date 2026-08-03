import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect as vitestExpect } from "vitest";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/auth-card";

vitestExpect.extend(toHaveNoViolations);

describe("accessibility: auth form primitives", () => {
  it("Field renders with no axe violations, including when showing an error", async () => {
    const { container } = render(
      <Field label="Email" type="email" error="Enter a valid email" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Button has no axe violations and is keyboard focusable", async () => {
    const { container, getByRole } = render(<Button>Submit</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(getByRole("button")).not.toHaveAttribute("tabindex", "-1");
  });

  it("AuthCard's heading structure has no axe violations", async () => {
    const { container } = render(
      <AuthCard eyebrow="Welcome back" title="Sign in">
        <Field label="Email" type="email" />
      </AuthCard>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
