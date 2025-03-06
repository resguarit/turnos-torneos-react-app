import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Volver = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center px-4 py-2 bg-gray-100">
      <Button 
        onClick={() => navigate('/')} 
        variant="ghost" 
        className="flex items-center gap-2 hover:bg-naranja hover:text-white rounded-xl"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Volver al inicio</span>
      </Button>
    </div>
  );
};

export default Volver;