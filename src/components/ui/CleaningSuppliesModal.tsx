// src/components/ui/CleaningSuppliesModal.tsx
import React, { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';

// List of cleaning supplies
const CLEANING_SUPPLIES = [
  'Bona',
  'Mop & Bucket',
  'Duster',
  'Microfiber cloths/Rags',
  'Broom & Dustpan',
  'Garbage Bags',
  'Clorox Bleach',
  'Easy-off',
  'Baking soda',
  'Glass Cleaner',
  'Murphy',
  'Toilet Brush',
  'Paper Towels',
  'Sponges',
  'Abrasive Scrubber',
  'All-purpose cleaner',
  'White Vinegar',
  'Pine-SOL',
  'Soft Scrub'
];

interface CleaningSuppliesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (suppliesOption: string, selectedSupplies: string[]) => void;
}

const CleaningSuppliesModal: React.FC<CleaningSuppliesModalProps> = ({ 
  isOpen, 
  onClose,
  onSave 
}) => {
  const [suppliesOption, setSuppliesOption] = useState<string>('bring-everything');
  const [selectedSupplies, setSelectedSupplies] = useState<string[]>([...CLEANING_SUPPLIES]);

  const toggleSupply = (supply: string) => {
    if (selectedSupplies.includes(supply)) {
      setSelectedSupplies(selectedSupplies.filter(item => item !== supply));
    } else {
      setSelectedSupplies([...selectedSupplies, supply]);
    }
  };

  const selectAll = () => {
    setSelectedSupplies([...CLEANING_SUPPLIES]);
  };

  const deselectAll = () => {
    setSelectedSupplies([]);
  };

  const handleConfirm = () => {
    onSave(suppliesOption, selectedSupplies);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30">
      <div className="bg-white w-full max-w-xs rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Cleaning Supplies</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-3">
          {/* Options */}
          <div className="space-y-2 mb-3">
            {/* Option 1 */}
            <div 
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
                suppliesOption === 'bring-everything' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => setSuppliesOption('bring-everything')}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-800">Bring Everything</h3>
                  <p className="text-gray-600 text-xs">We'll bring all cleaning supplies</p>
                  <p className="text-gray-700 text-xs">Standard price</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                suppliesOption === 'bring-everything' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
              }`}>
                {suppliesOption === 'bring-everything' && <div className="w-3 h-3 bg-white rounded-full"></div>}
              </div>
            </div>

            {/* Option 2 */}
            <div 
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
                suppliesOption === 'i-have-vacuum' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => setSuppliesOption('i-have-vacuum')}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-500 text-lg">$</span>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-800">I Have a Vacuum</h3>
                  <p className="text-gray-600 text-xs">We'll bring supplies, you provide vacuum</p>
                  <p className="text-green-500 font-medium text-xs">Save $20</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                suppliesOption === 'i-have-vacuum' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
              }`}>
                {suppliesOption === 'i-have-vacuum' && <div className="w-3 h-3 bg-white rounded-full"></div>}
              </div>
            </div>

            {/* Option 3 */}
            <div 
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
                suppliesOption === 'i-have-all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => setSuppliesOption('i-have-all')}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-500 text-lg">$</span>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-800">I Have Vacuum & Supplies</h3>
                  <p className="text-gray-600 text-xs">You provide all supplies & equipment</p>
                  <p className="text-green-500 font-medium text-xs">Save $50</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                suppliesOption === 'i-have-all' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
              }`}>
                {suppliesOption === 'i-have-all' && <div className="w-3 h-3 bg-white rounded-full"></div>}
              </div>
            </div>
          </div>

          {/* Always show supplies section - removed the condition */}
          <div className="flex items-center justify-between mb-3 mt-4">
            <h3 className="text-gray-800 text-sm font-medium">Select your supplies:</h3>
            <div className="text-blue-500 text-xs font-medium">{selectedSupplies.length}/{CLEANING_SUPPLIES.length} selected</div>
          </div>
          
          <div className="flex justify-between mb-2">
            <button 
              className="bg-blue-50 text-blue-500 px-3 py-1 rounded-md text-xs"
              onClick={selectAll}
            >
              Select All
            </button>
            <button 
              className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs"
              onClick={deselectAll}
            >
              Deselect All
            </button>
          </div>

          {/* Supply Checkboxes */}
          <div className="border rounded-lg p-2 mb-3 max-h-56 overflow-y-auto">
            <div className="grid grid-cols-2 gap-y-2 gap-x-1">
              {CLEANING_SUPPLIES.map((supply, index) => (
                <div 
                  key={index} 
                  className={`flex items-center p-1 rounded cursor-pointer ${
                    selectedSupplies.includes(supply) ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleSupply(supply)}
                >
                  <div className={`w-4 h-4 border rounded flex items-center justify-center mr-1 ${
                    selectedSupplies.includes(supply) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                  }`}>
                    {selectedSupplies.includes(supply) && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-gray-700">{supply}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Button */}
          <button 
            className="w-full bg-blue-500 text-white py-2 rounded-[36px] text-sm cursor-pointer"
            onClick={handleConfirm}
          >
            Confirm & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default CleaningSuppliesModal;