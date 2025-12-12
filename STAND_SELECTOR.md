# Stand Selector Feature

## Overview
Fitur pemilihan stand untuk memfilter data meja berdasarkan stand. Setiap stand memiliki 5 meja (total 50 meja dibagi menjadi 10 stand).

## Architecture

### Stand Distribution
```
Total: 50 Meja / 10 Stand = 5 Meja per Stand

Stand 1  → Meja 1-5   (table_number: "1" - "5")
Stand 2  → Meja 1-5   (table_number: "1" - "5")
Stand 3  → Meja 1-5   (table_number: "1" - "5")
...
Stand 10 → Meja 1-5   (table_number: "1" - "5")
```

## Implementation

### Component: StandSelector
**Location**: `components/StandSelector.tsx`

Terdapat 2 varian:
1. **StandSelector** - Full page selector dengan stats
2. **CompactStandSelector** - Compact version untuk navigation bar

#### Props
```typescript
interface StandSelectorProps {
  onStandSelect: (standId: number) => void;
  selectedStand: number | null;
  standsData?: Array<{
    standId: number;
    total: number;
    available: number;
    occupied: number;
  }>;
}
```

### Features

#### 1. Visual Stand Grid
- Grid layout 2-3-5 columns (responsive)
- 10 stand buttons (Stand 1 - Stand 10)
- Visual indication untuk selected stand
- Hover effects & animations

#### 2. Real-time Stats (Optional)
- Meja tersedia per stand (badge hijau)
- Meja terisi per stand (badge abu)
- Data dari `getTableStats()`

#### 3. LocalStorage Persistence
```typescript
// Save selected stand
localStorage.setItem('selectedStand', standId.toString());

// Load on mount
const savedStand = localStorage.getItem('selectedStand');
```

#### 4. Stand Switching
- Button "Ganti Stand" di setiap halaman
- Reset ke stand selector view
- Preserve current page context

## Integration in Pages

### Dashboard (`app/dashboard/page.tsx`)

**Flow:**
```
1. Load savedStand from localStorage
2. Show StandSelector if no stand selected
3. User selects stand → Save to localStorage
4. Fetch & filter data for selected stand
5. Show "Ganti Stand" button in header
```

**Filter Implementation:**
```typescript
// Filter tables by stand
const filteredTables = selectedStand 
  ? apiTables.filter(table => table.stand_id === selectedStand)
  : apiTables;
```

**Key Changes:**
- Added `selectedStand` state
- Only fetch data when stand is selected
- Filter API results by `stand_id`
- Show stand number in header
- Add "Ganti Stand" button

### Customer Page (`app/customer/page.tsx`)

**Same pattern as Dashboard:**
- Stand selector on first load
- Filter tables by `stand_id`
- "Ganti Stand" button in header
- LocalStorage persistence

### Cleaning Page (`app/cleaning/page.tsx`)

**Same pattern:**
- Stand selector required before showing data
- Filter completed transactions by stand's tables
- Stand context in all calculations

## User Flow

### First Visit
```
1. User opens /dashboard
2. No stand selected → Show StandSelector
3. User clicks "Stand 5"
4. Saves to localStorage
5. Shows dashboard for Stand 5 only (5 meja)
```

### Subsequent Visits
```
1. User opens /dashboard
2. localStorage has "Stand 5"
3. Auto-load Stand 5 data
4. Show dashboard directly
```

### Switching Stands
```
1. User clicks "Ganti Stand" button
2. Clear selected stand (set to null)
3. Show StandSelector again
4. User selects different stand
5. Update localStorage
6. Fetch new data
```

## Benefits

### 1. Better Organization
✅ Separate data by stand (tidak campur)
✅ Easier to monitor specific stand
✅ Cleaner UI dengan data focused

### 2. Performance
✅ Load only 5 meja instead of 50
✅ Faster API processing
✅ Less data to render

### 3. User Experience
✅ Clear stand selection UI
✅ Persistent selection (localStorage)
✅ Easy stand switching
✅ Visual feedback

### 4. Scalability
✅ Easy to add more stands
✅ Flexible filtering
✅ Reusable component

## Component Usage

### Basic Usage
```typescript
import { StandSelector } from '@/components/StandSelector';

function MyPage() {
  const [selectedStand, setSelectedStand] = useState<number | null>(null);

  if (selectedStand === null) {
    return (
      <StandSelector 
        onStandSelect={setSelectedStand}
        selectedStand={selectedStand}
      />
    );
  }

  // Show page content for selected stand
  return <div>Stand {selectedStand} content</div>;
}
```

### With Stats
```typescript
<StandSelector 
  onStandSelect={handleStandSelect}
  selectedStand={selectedStand}
  standsData={[
    { standId: 1, total: 5, available: 3, occupied: 2 },
    { standId: 2, total: 5, available: 4, occupied: 1 },
    // ... more stands
  ]}
/>
```

### Compact Version
```typescript
import { CompactStandSelector } from '@/components/StandSelector';

<CompactStandSelector 
  onStandSelect={handleStandSelect}
  selectedStand={selectedStand}
/>
```

## Customization

### Change Stand Count
Edit component to show different number of stands:
```typescript
// In StandSelector.tsx
{Array.from({ length: 15 }, (_, i) => { // Change 10 to 15
  const standId = i + 1;
  // ...
})}
```

### Add Stand Names
```typescript
const STAND_NAMES = {
  1: "Stand A",
  2: "Stand B",
  // ...
};

<p>Stand {standId} - {STAND_NAMES[standId]}</p>
```

### Custom Styling
Modify Tailwind classes in component:
```typescript
className={`
  ${isSelected 
    ? 'border-purple-600 bg-purple-50' // Change colors
    : 'border-slate-200 bg-white'
  }
`}
```

## Testing

### Test Stand Selection
1. Open `/dashboard`
2. Select any stand
3. Verify localStorage: `localStorage.getItem('selectedStand')`
4. Verify only 5 meja displayed
5. Click "Ganti Stand"
6. Select different stand
7. Verify data changes

### Test Persistence
1. Select Stand 3
2. Refresh page
3. Verify Stand 3 still selected
4. Navigate to `/customer`
5. Verify Stand 3 selected there too

### Test Filtering
1. Check network tab
2. Verify full API response (50 meja)
3. Verify UI shows only 5 meja for selected stand
4. Check `stand_id` matches selected stand

## Troubleshooting

### Stand not persisting
**Issue**: Stand resets on page refresh
**Solution**: Check localStorage is enabled in browser

### Wrong tables showing
**Issue**: Seeing tables from different stand
**Solution**: Verify filter logic: `table.stand_id === selectedStand`

### Stats not showing
**Issue**: Badge counts are wrong
**Solution**: Pass correct `standsData` prop from `getTableStats()`

## Future Enhancements

1. **Stand Info Card**
   - Stand location/description
   - Contact person
   - Operating hours

2. **Stand Comparison**
   - Compare stats across stands
   - Best performing stand
   - Alerts per stand

3. **Multi-Stand View**
   - Select multiple stands
   - Combined view
   - Cross-stand analytics

4. **Stand Search**
   - Search by stand name
   - Filter by availability
   - Quick jump to stand

---

**Status**: ✅ Implemented
**Date**: December 12, 2025
**Files Modified**: 
- Dashboard, Customer, Cleaning pages
- New component: StandSelector
