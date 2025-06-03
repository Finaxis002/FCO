import React from "react";
import type { Service } from "../../types/service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  services: Service[];
  onDelete: (id: string) => void;
  activeServiceId?: string;
}

export default function ServiceCardView({ services, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {services.map((service) => (
        <Card key={service._id} className="relative">
          <CardContent className="p-4">
            <div className="font-bold">{service.name}</div>
            <div className="text-sm text-muted-foreground mb-2">{service.status}</div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(service._id)}
            >
              Delete
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}