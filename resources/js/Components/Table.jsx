export function getValueByAccessor(obj, accessor) {
    return accessor.split('.').reduce((acc, key) => acc?.[key], obj);
}

const Table = ({ columns, data, onToggle, maxHeight = "70vh" }) => {
    return (
        <div className="overflow-auto border rounded" style={{ maxHeight }}>
            <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10">
                <tr>
                    {columns.map((col, i) => (
                        <th key={col.accessor || i} className="border-t px-4 py-2 text-left font-medium bg-gray-100 whitespace-nowrap">
                            {col.header}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((row) => (
                    <tr key={row.id || row.uuid || JSON.stringify(row)}>
                        {columns.map((col, j) => (
                            <td key={col.accessor || j} className="border-t px-4 py-2">
                                {col.render ? (
                                    col.render(row)
                                ) : col.accessor === 'active' ? (
                                    <button
                                        onClick={() => onToggle(row)}
                                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                                            row[col.accessor] ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                    >
                                        <div
                                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                                                row[col.accessor] ? 'translate-x-6' : ''
                                            }`}
                                        />
                                    </button>
                                ) : (
                                    getValueByAccessor(row, col.accessor)
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
