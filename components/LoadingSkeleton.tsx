export default function LoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl h-32"></div>
                <div className="bg-slate-800/50 rounded-xl h-32"></div>
            </div>
            <div className="bg-slate-800/50 rounded-xl h-48"></div>
            <div className="bg-slate-800/50 rounded-xl h-64"></div>
        </div>
    );
}
