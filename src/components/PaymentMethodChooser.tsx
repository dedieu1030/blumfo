
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { Icons } from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { getAvailablePaymentMethods, PaymentMethod } from "@/services/paymentService";

interface PaymentMethodChooserProps {
  onSelectPaymentMethod: (method: PaymentMethod) => void;
  selectedMethodCode?: string;
  disabled?: boolean;
  showDescriptions?: boolean;
  hideTitle?: boolean;
}

export function PaymentMethodChooser({
  onSelectPaymentMethod,
  selectedMethodCode,
  disabled = false,
  showDescriptions = true,
  hideTitle = false
}: PaymentMethodChooserProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | undefined>(selectedMethodCode);
  const { toast } = useToast();

  useEffect(() => {
    async function loadPaymentMethods() {
      setIsLoading(true);
      try {
        const methods = await getAvailablePaymentMethods();
        setPaymentMethods(methods);
        
        // Si aucune méthode n'est sélectionnée et qu'il y a des méthodes disponibles,
        // sélectionner la première par défaut
        if (!selectedMethod && methods.length > 0) {
          setSelectedMethod(methods[0].code);
          onSelectPaymentMethod(methods[0]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des méthodes de paiement", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les méthodes de paiement",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadPaymentMethods();
  }, []);

  const handleMethodChange = (value: string) => {
    setSelectedMethod(value);
    const method = paymentMethods.find(m => m.code === value);
    if (method) {
      onSelectPaymentMethod(method);
    }
  };

  // Mapper les codes d'icônes aux composants Lucide
  const getMethodIcon = (iconName: string | undefined) => {
    if (!iconName) return <CreditCard className="h-5 w-5" />;
    
    const IconComponent = Icons[iconName as keyof typeof Icons];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />;
  };

  return (
    <Card>
      {!hideTitle && (
        <CardHeader>
          <CardTitle>Méthode de paiement</CardTitle>
          <CardDescription>Choisissez comment vous souhaitez effectuer le paiement</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Aucune méthode de paiement disponible
          </div>
        ) : (
          <RadioGroup
            value={selectedMethod}
            onValueChange={handleMethodChange}
            className="space-y-3"
            disabled={disabled}
          >
            {paymentMethods.map((method) => (
              <div
                key={method.code}
                className={`flex items-center space-x-2 rounded-md border p-4 ${
                  selectedMethod === method.code ? "border-primary bg-primary/5" : ""
                }`}
              >
                <RadioGroupItem value={method.code} id={`payment-${method.code}`} />
                <Label
                  htmlFor={`payment-${method.code}`}
                  className="flex flex-1 items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-muted p-2">
                      {getMethodIcon(method.icon)}
                    </div>
                    <div>
                      <div className="font-medium">{method.name}</div>
                      {showDescriptions && method.description && (
                        <div className="text-sm text-muted-foreground">
                          {method.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedMethod === method.code && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </CardContent>
    </Card>
  );
}
