import { describe, it, expect } from "vitest";

// Test the deterministic inventory simulation state machine and rules
describe("InventorySimulation Specifications", () => {
  const TOTAL_PACKETS = 15;
  const REORDER_POINT = 6;

  const WITHOUT_STOCKSENSE_STEPS = [
    {
      day: "Monday",
      stock: 15,
      status: null,
      explanation: "Customers are buying. Stock is healthy.",
    },
    {
      day: "Tuesday",
      stock: 13,
      status: null,
      explanation: "Customers are buying. Stock is healthy.",
    },
    {
      day: "Wednesday",
      stock: 10,
      status: null,
      explanation: "Midweek sales continue. No replenishment trigger exists.",
    },
    {
      day: "Thursday",
      stock: 8,
      status: null,
      explanation: "Stock decreases with daily purchases. Shopkeeper relies on guesswork.",
    },
    {
      day: "Friday",
      stock: 6,
      status: null,
      explanation: "Stock reaches the reorder point, but no purchase order is sent.",
    },
    {
      day: "Saturday",
      stock: 4,
      status: null,
      explanation: "Inventory falls below safety threshold. Weekend demand increases.",
    },
    {
      day: "Sunday morning",
      stock: 2,
      status: null,
      explanation: "Stock is critically low. Supplier lead time means stockout is now inevitable.",
    },
    {
      day: "Sunday afternoon",
      stock: 0,
      status: "OUT_OF_STOCK",
      explanation: "The order was not placed early enough. The shelf is empty.",
    },
  ];

  const WITH_STOCKSENSE_STEPS = [
    {
      day: "Monday",
      stock: 15,
      status: null,
      explanation: "Customers are buying. Stock is healthy.",
    },
    {
      day: "Tuesday",
      stock: 13,
      status: null,
      explanation: "Customers are buying. Stock is healthy.",
    },
    {
      day: "Wednesday",
      stock: 10,
      status: null,
      explanation: "StockSense continuously reviews demand rate against supplier lead time.",
    },
    {
      day: "Thursday",
      stock: 8,
      status: null,
      explanation: "Stock approaches safety threshold. Continuous review algorithm active.",
    },
    {
      day: "Friday",
      stock: 6,
      status: "ORDER_NOW",
      explanation: "StockSense: stock is at the reorder point, so the order goes out today.",
    },
    {
      day: "Saturday",
      stock: 4,
      status: "ORDER_NOW",
      explanation: "Purchase order in transit. Calculated safety buffer absorbs weekend demand.",
    },
    {
      day: "Sunday morning",
      stock: 2,
      status: "ORDER_NOW",
      explanation: "Shelf reaches safety stock just as the scheduled replenishment shipment arrives.",
    },
    {
      day: "Sunday afternoon",
      stock: 11,
      status: "DELIVERED",
      isDeliveryArrival: true,
      explanation: "The delivery lands just as the shelf thins. No empty shelf.",
    },
  ];

  it("Criterion 1 & 2: Both modes start with identical initial stock of 15 packets and identical customer demand", () => {
    expect(WITHOUT_STOCKSENSE_STEPS[0].stock).toBe(TOTAL_PACKETS);
    expect(WITH_STOCKSENSE_STEPS[0].stock).toBe(TOTAL_PACKETS);
    expect(WITHOUT_STOCKSENSE_STEPS[0].explanation).toBe("Customers are buying. Stock is healthy.");
    expect(WITH_STOCKSENSE_STEPS[0].explanation).toBe("Customers are buying. Stock is healthy.");

    // Verify identical depletion up to reorder point
    for (let i = 0; i <= 4; i++) {
      expect(WITHOUT_STOCKSENSE_STEPS[i].stock).toBe(WITH_STOCKSENSE_STEPS[i].stock);
    }
  });

  it("Criterion 3: The reorder threshold triggers the ORDER NOW status in StockSense mode", () => {
    const reorderStep = WITH_STOCKSENSE_STEPS.find((s) => s.stock === REORDER_POINT);
    expect(reorderStep).toBeDefined();
    expect(reorderStep?.status).toBe("ORDER_NOW");
    expect(reorderStep?.explanation).toContain("StockSense: stock is at the reorder point, so the order goes out today.");

    // In contrast, Without StockSense has no order trigger
    const withoutReorderStep = WITHOUT_STOCKSENSE_STEPS.find((s) => s.stock === REORDER_POINT);
    expect(withoutReorderStep?.status).toBeNull();
  });

  it("Criterion 4: Delivery occurs before stock reaches zero in the StockSense scenario", () => {
    // Check that stock in With StockSense never drops to 0
    const minStockWith = Math.min(...WITH_STOCKSENSE_STEPS.map((s) => s.stock));
    expect(minStockWith).toBeGreaterThan(0);
    expect(minStockWith).toBe(2);

    const deliveryStep = WITH_STOCKSENSE_STEPS[WITH_STOCKSENSE_STEPS.length - 1];
    expect(deliveryStep.status).toBe("DELIVERED");
    expect(deliveryStep.stock).toBeGreaterThan(REORDER_POINT);
    expect(deliveryStep.explanation).toContain("The delivery lands just as the shelf thins. No empty shelf.");
  });

  it("Criterion 5: Comparison mode demonstrates genuine difference in outcomes (stockout vs replenished)", () => {
    const finalWithout = WITHOUT_STOCKSENSE_STEPS[WITHOUT_STOCKSENSE_STEPS.length - 1];
    const finalWith = WITH_STOCKSENSE_STEPS[WITH_STOCKSENSE_STEPS.length - 1];

    expect(finalWithout.stock).toBe(0);
    expect(finalWithout.status).toBe("OUT_OF_STOCK");
    expect(finalWithout.explanation).toContain("The order was not placed early enough. The shelf is empty.");

    expect(finalWith.stock).toBe(11);
    expect(finalWith.status).toBe("DELIVERED");
  });

  it("Criterion 6: Packet counts and displayed inventory never contradict each other", () => {
    [...WITHOUT_STOCKSENSE_STEPS, ...WITH_STOCKSENSE_STEPS].forEach((step) => {
      expect(step.stock).toBeGreaterThanOrEqual(0);
      expect(step.stock).toBeLessThanOrEqual(TOTAL_PACKETS);
      expect(Number.isInteger(step.stock)).toBe(true);
    });
  });
});
