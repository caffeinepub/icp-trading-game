# Specification

## Summary
**Goal:** Replace candlestick chart with line chart and integrate Kong Swap trading tools into the frontend.

**Planned changes:**
- Replace candlestick chart visualization in PriceChart component with a simple line chart
- Update useICPPriceData hook to fetch timestamp/price pairs instead of OHLC data from Kong Swap API
- Integrate Kong Swap trading tools including volume indicators, liquidity metrics, order book depth, and technical analysis tools

**User-visible outcome:** Users see a line chart displaying ICP price trends with enhanced trading tools from Kong Swap, including volume data, liquidity metrics, and technical indicators, while maintaining all margin statistics and liquidation price overlays.
