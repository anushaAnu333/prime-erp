"use client";

import ReduxTest from "@/components/ReduxTest";
import DebugRedux from "@/components/DebugRedux";

export default function TestReduxPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Redux Implementation Test
        </h1>
        <p className="text-gray-600 mb-8">
          This page demonstrates the Redux implementation in the Prima ERP
          application. The data below is fetched using Redux actions and
          displayed using Redux state.
        </p>

        <DebugRedux />

        <ReduxTest />

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Redux Benefits Demonstrated:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Centralized state management</li>
            <li>• Automatic caching and optimized re-renders</li>
            <li>• Consistent data flow across components</li>
            <li>• Better debugging with Redux DevTools</li>
            <li>• Scalable architecture for large applications</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
