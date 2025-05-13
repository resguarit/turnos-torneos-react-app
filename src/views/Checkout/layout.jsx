import React from 'react';

const CheckoutLayout = ({ children, status }) => {

    let backgroundColor;
    switch (status) {
        case "success":
            backgroundColor = "from-gray-100 to-green-400";
            break;
        case "pending":
            backgroundColor = "from-gray-100 to-amber-400";
            break;
        case "failure":
            backgroundColor = "from-gray-100 to-red-400";
            break;
        default:
            backgroundColor = "from-gray-100 to-gray-200";
            break;
    }
  return (
    <div className={`flex min-h-screen items-center justify-center bg-gradient-to-b ${backgroundColor}`}>
        <div className="items-center justify-center w-full">
            {children}
        </div>
    </div>
  );
};

export default CheckoutLayout;
