"use client";

import { useState } from "react";

type AlertProps = {
	message: string;
	onClose?: () => void;
};

export default function Alert({ message, onClose }: AlertProps) {
	const [isVisible, setIsVisible] = useState(true);

	const handleClose = () => {
		setIsVisible(false);
		onClose?.();
	};

	if (!isVisible) {
		return null;
	}

	return (
		<div className="fixed top-0 left-0 z-50 w-full border-t-4 border-blue-600 bg-blue-100 px-4 py-4 text-blue-900">
			<div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						className="h-5 w-5 shrink-0"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<circle cx="12" cy="12" r="9" />
						<path d="M12 8h.01" />
						<path d="M11 12h1v4h1" />
					</svg>
					<p className="font-bold">{message}</p>
				</div>

				<button
					type="button"
					aria-label="Close alert"
					onClick={handleClose}
					className="rounded p-1 text-blue-900 transition hover:bg-blue-200"
				>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						className="h-5 w-5"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path d="M6 6l12 12" />
						<path d="M18 6l-12 12" />
					</svg>
				</button>
			</div>
		</div>
	);
}

