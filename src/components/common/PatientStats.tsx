import React from "react";
import { Users } from "lucide-react";

export default function PatientStats({ total, label }: { total: number; label: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-800 shadow-md">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-green-500/20 rounded-lg">
          <Users className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">{total}</h3>
          <p className="text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}
