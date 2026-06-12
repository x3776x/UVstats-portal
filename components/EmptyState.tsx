interface EmptyStateProps {
    modelName: string;
}

export default function EmptyState({ modelName }: EmptyStateProps) {
    return (
        <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed
         border-gray-200">
            <p className="text-4xl mb-4">🚧</p>
            <p className="text-lg font-medium text-gray-700">
                {modelName}
            </p>
            <p className="text-sm text-gray-400"> WIP </p>
        </div>
    );
}