// src/layouts/BusinessLayout.jsx
import Sidebar from "../business_components/Business_Panel_Sidebar";
import Navbar from "../business_components/Navbar";

const BusinessLayout = ({ children }) => {
	return (
		<>
			<Navbar />
			<div className="flex pt-16"> {/* pt-16 = 64px (matches fixed navbar height) */}
  				<Sidebar panelType="businessPanel" />
  				<div className="flex-1 p-4">{children}
  			</div>
</div>
		</>
	);
};

export default BusinessLayout;
