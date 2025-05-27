"use client";
import React from "react";
import EndpointCard from "./ui/EndpointCard";

// Define a type for endpoint status
export type EndpointStatus = "Ready" | "In Progress";

interface Endpoint {
  title: string;
  status: EndpointStatus;
  description?: string;
}

const endpoints: { section: string; endpoints: Endpoint[] }[] = [
  // Account
  { section: "Account", endpoints: [
    { title: "Balance", status: "Ready" },
    { title: "Positions", status: "Ready" },
    { title: "Position History", status: "In Progress" },
    { title: "Position Risks", status: "In Progress" },
    { title: "Bills", status: "Ready" },
    { title: "Bills Archive", status: "In Progress" },
    { title: "Configuration", status: "In Progress" },
    { title: "Account Instruments", status: "In Progress" },
  ]},
  // Trading
  { section: "Trading", endpoints: [
    { title: "Create Order", status: "Ready" },
    { title: "Create Multiple Orders", status: "In Progress" },
    { title: "Cancel Order", status: "In Progress" },
    { title: "Cancel Multiple Orders", status: "In Progress" },
    { title: "Amend Order", status: "In Progress" },
    { title: "Order Details", status: "In Progress" },
    { title: "Active Orders", status: "Ready" },
    { title: "Order History", status: "Ready" },
  ]},
  // Market Data
  { section: "Market Data", endpoints: [
    { title: "Tickers", status: "Ready" },
    { title: "Ticker", status: "In Progress" },
    { title: "Index Tickers", status: "In Progress" },
    { title: "Order Book", status: "Ready" },
    { title: "Candles", status: "Ready" },
    { title: "Historical Candles", status: "In Progress" },
    { title: "Index Candles", status: "In Progress" },
    { title: "Mark Price Candles", status: "In Progress" },
  ]},
  // Public Data
  { section: "Public Data", endpoints: [
    { title: "Instruments", status: "Ready" },
    { title: "Delivery History", status: "In Progress" },
    { title: "Open Interest", status: "In Progress" },
    { title: "Funding Rate", status: "Ready" },
    { title: "Funding Rate History", status: "In Progress" },
    { title: "Price Limits", status: "In Progress" },
    { title: "Options Summary", status: "In Progress" },
    { title: "Estimated Price", status: "In Progress" },
    { title: "Discount Info", status: "In Progress" },
    { title: "Server Time", status: "Ready" },
    { title: "Liquidation Orders", status: "In Progress" },
    { title: "Mark Price", status: "In Progress" },
  ]},
  // System
  { section: "System", endpoints: [
    { title: "System Status", status: "Ready" },
  ]},
];

export default function EndpointsShowcase() {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">API Endpoints</h2>
      <div className="flex flex-col gap-10">
        {endpoints.map(({ section, endpoints }) => (
          <div key={section}>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-3">{section}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {endpoints.map((ep) => (
                <EndpointCard key={ep.title} title={ep.title} status={ep.status} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
