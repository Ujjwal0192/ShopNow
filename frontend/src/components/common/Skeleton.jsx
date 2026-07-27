export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="skeleton h-56 w-full" />
    <div className="p-4 space-y-3">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-5 w-1/3" />
      <div className="skeleton h-10 w-full mt-2" />
    </div>
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-10">
    <div className="skeleton h-96 rounded-xl" />
    <div className="space-y-4">
      <div className="skeleton h-8 w-3/4" />
      <div className="skeleton h-4 w-1/3" />
      <div className="skeleton h-6 w-1/4" />
      <div className="skeleton h-24 w-full" />
      <div className="skeleton h-12 w-full" />
      <div className="skeleton h-12 w-full" />
    </div>
  </div>
);

export const OrderRowSkeleton = () => (
  <div className="bg-white rounded-xl p-4 space-y-2">
    <div className="flex justify-between">
      <div className="skeleton h-4 w-32" />
      <div className="skeleton h-4 w-20" />
    </div>
    <div className="skeleton h-3 w-48" />
    <div className="skeleton h-3 w-24" />
  </div>
);

export const TableRowSkeleton = ({ cols = 4 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="skeleton h-4 w-full" />
      </td>
    ))}
  </tr>
);
