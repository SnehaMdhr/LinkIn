function StatisticsCard({ linkCount }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center">
      <p className="text-3xl font-bold text-blue-600">{linkCount}</p>
      <p className="text-sm text-gray-500 mt-1">
        {linkCount === 1 ? "Link" : "Links"} Added
      </p>
    </div>
  );
}

export default StatisticsCard;