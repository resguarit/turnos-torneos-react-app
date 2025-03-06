import React from "react";
import { X } from "lucide-react";

function ModalConfirmation({ onConfirm, onCancel, title, subtitle, botonText1, botonText2 }){
    return(
        <div className="z-50 fixed inset-0 bg-black/50 flex items-center justify-center font-inter">
            <div className="bg-white text-black z-20 rounded-2xl shadow-lg max-w-[250px] lg:max-w-[400px] w-11/12">
                <div className="md:p-6 p-3 space-y-2 md:space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg lg:text-xl font-medium">{title}</h2>
                        <X 
                            onClick={onCancel} 
                            className="cursor-pointer h-5 w-5 text-gray-500 hover:text-gray-700" 
                        />
                    </div>
                    <div className="space-y-3 pt-2">
                        <button
                            onClick={onConfirm}
                            className="text-sm md:text-base w-full bg-naranja hover:bg-naranja/90 text-white rounded-[10px] py-2"
                        >
                            {botonText2}
                        </button>
                        <button
                            onClick={onCancel}
                            className="text-sm md:text-base w-full rounded-[10px] py-2 border border-black"
                        >
                            {botonText1}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalConfirmation;