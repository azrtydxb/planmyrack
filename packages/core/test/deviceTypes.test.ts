import { describe, it, expect, vi } from "vitest";
import { DEVICE_TYPES, UNIT_SIZES, newLayout, newId } from "../src/index.js";

describe("TestDeviceTypeTableIsConsistent", () => {
  it("gives every type at least one size drawn from UNIT_SIZES", () => {
    for (const spec of Object.values(DEVICE_TYPES)) {
      expect(spec.sizes.length).toBeGreaterThan(0);
      expect(spec.sizes.every((s) => UNIT_SIZES.includes(s))).toBe(true);
    }
  });

  it("never defaults a device to more ports or outlets than it allows", () => {
    for (const spec of Object.values(DEVICE_TYPES)) {
      expect(spec.defaultPorts).toBeLessThanOrEqual(spec.maxPorts);
      expect(spec.defaultOutlets).toBeLessThanOrEqual(spec.maxOutlets);
    }
  });

  it("gives cable management, shelves and blanks no ports at all", () => {
    for (const t of ["hooks", "brush", "shelf", "blank"] as const) {
      expect(DEVICE_TYPES[t].maxPorts).toBe(0);
    }
  });

  it("draws no power through the types that are not electrical", () => {
    for (const t of ["hooks", "brush", "shelf", "blank"] as const) {
      expect(DEVICE_TYPES[t].drawsPower).toBe(false);
    }
    for (const t of ["equipment", "server", "switch", "ups"] as const) {
      expect(DEVICE_TYPES[t].drawsPower).toBe(true);
    }
  });

  it("supplies outlets only from the types that distribute power", () => {
    expect(DEVICE_TYPES.pdu.maxOutlets).toBeGreaterThan(0);
    expect(DEVICE_TYPES.equipment.maxOutlets).toBe(0);
  });

  it("starts a new layout with one 19-inch rack and nothing in it", () => {
    const l = newLayout("Basement");
    expect(l.racks).toHaveLength(1);
    expect(l.racks[0]!.width).toBe(19);
    expect([l.devices.length, l.links.length, l.revision]).toEqual([0, 0, 0]);
  });
});

describe("TestIdsAreUniqueWithoutCrypto", () => {
  it("mints 10000 distinct ids", () => {
    expect(new Set(Array.from({ length: 10_000 }, newId)).size).toBe(10_000);
  });

  it("touches no crypto global", () => {
    const spy = vi.fn();
    const original = Object.getOwnPropertyDescriptor(globalThis, "crypto");
    Object.defineProperty(globalThis, "crypto", {
      get: spy,
      configurable: true,
    });
    newId();
    if (original) Object.defineProperty(globalThis, "crypto", original);
    expect(spy).not.toHaveBeenCalled();
  });
});
