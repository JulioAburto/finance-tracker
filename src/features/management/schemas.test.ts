import {
  areValidThresholds,
  isValidRulePattern,
  readNonNegativeNumber,
} from "./schemas";

describe("management validation", () => {
  it("acepta montos no negativos", () => {
    const formData = new FormData();
    formData.set("amount", "0");

    expect(readNonNegativeNumber(formData, "amount")).toBe(0);
  });

  it("valida el orden de umbrales", () => {
    expect(areValidThresholds(70, 80, 100)).toBe(true);
    expect(areValidThresholds(80, 70, 100)).toBe(false);
  });

  it("rechaza expresiones regulares inválidas", () => {
    expect(isValidRulePattern("amazon|amzn")).toBe(true);
    expect(isValidRulePattern("[")).toBe(false);
  });
});
