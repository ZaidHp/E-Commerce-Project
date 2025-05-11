const ModalWrapper = ({ children, isOpen, onClose }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
			<div className="bg-white rounded-lg shadow-lg p-6 relative w-full max-w-lg">
				<button
					className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
					onClick={onClose}
				>
					&times;
				</button>
				{children}
			</div>
		</div>
	);
};

export default ModalWrapper;
