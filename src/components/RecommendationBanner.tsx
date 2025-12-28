import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecommendationBannerProps {
    title: string;
    description: string;
    linkHref?: string;
    linkText?: string;
}

export function RecommendationBanner({ title, description, linkHref, linkText }: RecommendationBannerProps) {
    return (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6 flex items-start gap-4 text-amber-500">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-sm opacity-90 mt-1">{description}</p>
            </div>
            {linkHref && (
                <Link
                    href={linkHref}
                    className="shrink-0 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded text-xs font-medium transition-colors flex items-center gap-1"
                >
                    {linkText || "Go"} <ArrowRight className="h-3 w-3" />
                </Link>
            )}
        </div>
    );
}
