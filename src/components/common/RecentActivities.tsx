import { SquareArrowOutUpRight } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";

const statusStyles: Record<string, string> = {
  "completed": "bg-green-500/20 text-green-400",
  "Awaiting Review": "bg-yellow-500/20 text-yellow-400",
  "upcoming": "bg-red-500/20 text-red-400",
};

export default function RecentActivities({ patients }: { patients: any[] }) {
    const router = useRouter()

    const onClickHandler = () => {
        router.push('/appointments')
    }
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-800 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
        <h3 className="text-lg font-semibold">Scheduled Appointments</h3>
        <p className="text-gray-400 text-xs mt-2 mb-3">This shows 5 upcoming appointments</p>
        </div>
        <button className="text-sm text-green-400 hover:underline" onClick={onClickHandler}>
        <SquareArrowOutUpRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="pb-3">Patient Name</th>
              <th className="pb-3">Condition</th>
              <th className="pb-3">Scheduled Date</th>
              <th className="pb-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {patients?.map((p, i) => (
              <tr
                key={i}
                className="border-b border-gray-700 hover:bg-gray-700/50 transition"
              >
                <td className="py-3 font-medium text-white">{p?.patients?.full_name}</td>
                <td className="py-3 text-gray-300">{(p?.patients?.condition_type==='male_infertility' ? 'Male Infertility' : (p?.patients?.condition_type==='male_sexual_dysfunction' ? 'Male Sexual Dysfunction': ''))}</td>
                <td className="py-3 text-gray-300">{p?.scheduled_date}</td>
                <td className="py-3 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[p?.status]}`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
