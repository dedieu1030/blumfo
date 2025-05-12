
  // Add a function to handle product selection from catalog
  const handleAddProductFromCatalog = (product: Product) => {
    if (!product) return;

    const newServiceLine: ServiceLine = {
      id: Date.now().toString(),
      description: product.description || product.name,
      quantity: "1",
      unitPrice: (product.price_cents / 100).toString(),
      tva: product.tax_rate?.toString() || "20",
      total: (product.price_cents / 100).toString(),
      totalPrice: product.price_cents / 100
    };

    setServiceLines([...serviceLines, newServiceLine]);
    setIsProductModalOpen(false);
  };
