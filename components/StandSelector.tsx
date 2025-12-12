// Stand Selector Component
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, ChevronRight } from 'lucide-react';

interface StandSelectorProps {
  onStandSelect: (standId: number) => void;
  selectedStand: number | null;
  standsData?: Array<{ standId: number; total: number; available: number; occupied: number }>;
}

export function StandSelector({ onStandSelect, selectedStand, standsData }: StandSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Store className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Pilih Stand</h2>
        <p className="text-slate-600">Pilih stand untuk melihat status meja</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
        {Array.from({ length: 10 }, (_, i) => {
          const standId = i + 1;
          const standData = standsData?.find(s => s.standId === standId);
          const isSelected = selectedStand === standId;

          return (
            <button
              key={standId}
              onClick={() => onStandSelect(standId)}
              className={`
                group relative p-4 rounded-xl border-2 text-center transition-all duration-200
                ${isSelected 
                  ? 'border-blue-600 bg-blue-50 shadow-lg scale-105' 
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-102'
                }
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl
                  ${isSelected 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-600'
                  }
                `}>
                  {standId}
                </div>
                <div>
                  <p className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                    Stand {standId}
                  </p>
                  {standData && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Badge 
                        variant="outline" 
                        className="text-xs px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200"
                      >
                        {standData.available}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs px-1.5 py-0 bg-slate-100 text-slate-600 border-slate-200"
                      >
                        {standData.occupied}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <ChevronRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {standsData && (
        <div className="text-center text-sm text-slate-500 mt-4">
          <Badge variant="outline" className="mr-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block mr-1"></span>
            Tersedia
          </Badge>
          <Badge variant="outline">
            <span className="w-2 h-2 bg-slate-400 rounded-full inline-block mr-1"></span>
            Terisi
          </Badge>
        </div>
      )}
    </div>
  );
}

// Compact Stand Selector (untuk navigation bar)
export function CompactStandSelector({ onStandSelect, selectedStand }: Omit<StandSelectorProps, 'standsData'>) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-slate-700 mr-2">Stand:</span>
      {Array.from({ length: 10 }, (_, i) => {
        const standId = i + 1;
        const isSelected = selectedStand === standId;

        return (
          <button
            key={standId}
            onClick={() => onStandSelect(standId)}
            className={`
              w-10 h-10 rounded-lg font-bold text-sm transition-all
              ${isSelected 
                ? 'bg-blue-600 text-white shadow-md scale-110' 
                : 'bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-600'
              }
            `}
          >
            {standId}
          </button>
        );
      })}
    </div>
  );
}
