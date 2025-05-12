"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { MOCK_STATES, MOCK_AREAS, MOCK_SERVICE_DEFINITIONS } from "@/lib/constants";
import type { StateItem, AreaItem, ServiceDefinition } from "@/types/franchise";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface DataItem {
  id: string;
  name: string;
  [key: string]: any; // For additional properties like stateId
}

interface DataTableProps<T extends DataItem> {
  title: string;
  description: string;
  items: T[];
  onAddItem: (name: string, additionalProps?: Partial<T>) => void;
  onEditItem: (item: T) => void;
  onDeleteItem: (id: string) => void;
  renderAdditionalCols?: (item: T) => React.ReactNode;
  additionalFieldsForm?: React.ReactNode; // For complex add forms
}

function DataTable<T extends DataItem>({
  title,
  description,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  renderAdditionalCols,
}: DataTableProps<T>) {
  const [newItemName, setNewItemName] = useState("");

  const handleAddItem = () => {
    if (newItemName.trim()) {
      onAddItem(newItemName.trim());
      setNewItemName("");
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input 
            placeholder={`New ${title.slice(0, -1)} Name`} 
            value={newItemName} 
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
          />
          <Button onClick={handleAddItem}><PlusCircle className="h-4 w-4 mr-2"/>Add</Button>
        </div>
        {items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {renderAdditionalCols && <TableHead>Details</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  {renderAdditionalCols && <TableCell>{renderAdditionalCols(item)}</TableCell>}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEditItem(item)} className="mr-1">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteItem(item.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No {title.toLowerCase()} added yet.</p>
        )}
      </CardContent>
    </Card>
  );
}


export default function DataManagementSettings() {
  const { toast } = useToast();
  const [states, setStates] = useState<StateItem[]>(MOCK_STATES);
  const [areas, setAreas] = useState<AreaItem[]>(MOCK_AREAS);
  const [serviceDefinitions, setServiceDefinitions] = useState<ServiceDefinition[]>(MOCK_SERVICE_DEFINITIONS);

  // Placeholder CRUD operations - in a real app, these would call an API
  const crudHandler = <T extends DataItem>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    itemName: string
  ) => ({
    add: (name: string, additionalProps?: Partial<T>) => {
      const newItem = { id: `${itemName.toLowerCase()}-${Date.now()}`, name, ...additionalProps } as T;
      setter(prev => [...prev, newItem]);
      toast({ title: `${itemName} Added`, description: `${name} has been added.` });
    },
    edit: (itemToEdit: T) => {
      // For simplicity, just logging. Real edit would involve a form/dialog.
      console.log(`Editing ${itemName}:`, itemToEdit);
      toast({ title: `Edit ${itemName}`, description: `Editing ${itemToEdit.name}. (Dev placeholder)` });
    },
    delete: (id: string) => {
      setter(prev => prev.filter(item => item.id !== id));
      toast({ title: `${itemName} Deleted`, description: `${itemName} with ID ${id} has been removed.`, variant: "destructive" });
    },
  });

  const stateHandler = crudHandler(setStates, "State");
  const areaHandler = crudHandler(setAreas, "Area");
  const serviceDefHandler = crudHandler(setServiceDefinitions, "Service Definition");

  return (
    <div className="space-y-6">
      <DataTable
        title="Manage States"
        description="Add, edit, or delete states for franchise locations."
        items={states}
        onAddItem={stateHandler.add}
        onEditItem={stateHandler.edit}
        onDeleteItem={stateHandler.delete}
      />
      <DataTable
        title="Manage Areas"
        description="Add, edit, or delete areas within states."
        items={areas}
        onAddItem={(name) => areaHandler.add(name, { stateId: states[0]?.id || "defaultState" })} // Example: assign to first state
        onEditItem={areaHandler.edit}
        onDeleteItem={areaHandler.delete}
        renderAdditionalCols={(item) => (
          <span className="text-xs text-muted-foreground">
            State: {states.find(s => s.id === item.stateId)?.name || "N/A"}
          </span>
        )}
      />
      <DataTable
        title="Manage Service Definitions"
        description="Define the types of compliance services offered."
        items={serviceDefinitions}
        onAddItem={(name) => serviceDefHandler.add(name, { defaultStatus: "Pending" })}
        onEditItem={serviceDefHandler.edit}
        onDeleteItem={serviceDefHandler.delete}
        renderAdditionalCols={(item) => (
          <span className="text-xs text-muted-foreground">
            Default Status: {item.defaultStatus}
          </span>
        )}
      />
    </div>
  );
}
