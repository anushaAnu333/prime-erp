"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { 
  createProduct, 
  updateProduct, 
  fetchProductById,
  optimisticCreateProduct,
  optimisticUpdateProduct,
  revertOptimisticUpdate,
  clearError,
  clearCurrentProduct,
  selectCurrentProduct,
  selectProductsLoading,
  selectProductsError
} from "../lib/store/slices/productsSlice";
import Form from "./ui/Form";

const ProductForm = memo(function ProductForm({ productId = null, onSuccess }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Redux selectors
  const currentProduct = useAppSelector(selectCurrentProduct);
  const loading = useAppSelector(selectProductsLoading);
  const error = useAppSelector(selectProductsError);
  
  const [initialData, setInitialData] = useState({
    name: "",
    hsnCode: "",
    gstRate: "5",
  });

  const gstRates = [
    { value: "0", label: "0%" },
    { value: "5", label: "5%" },
    { value: "12", label: "12%" },
    { value: "18", label: "18%" },
    { value: "28", label: "28%" },
  ];

  const fields = [
    {
      name: "name",
      label: "Product Name",
      type: "text",
      placeholder: "Enter product name",
      required: true,
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
      },
    },
    {
      name: "hsnCode",
      label: "HSN Code",
      type: "text",
      placeholder: "Enter HSN code",
      required: true,
      validation: {
        required: true,
        minLength: 4,
        maxLength: 20,
      },
    },
    {
      name: "gstRate",
      label: "GST Rate",
      type: "select",
      placeholder: "Select GST rate",
      required: true,
      options: gstRates,
      validation: {
        required: true,
      },
    },
  ];

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
    } else {
      dispatch(clearCurrentProduct());
    }
    
    // Clear any previous errors
    dispatch(clearError());
    
    return () => {
      dispatch(clearCurrentProduct());
      dispatch(clearError());
    };
  }, [productId, dispatch]);

  useEffect(() => {
    if (currentProduct) {
      setInitialData({
        name: currentProduct.name || "",
        hsnCode: currentProduct.hsnCode || "",
        gstRate: currentProduct.gstRate?.toString() || "5",
      });
    }
  }, [currentProduct]);

  const handleSubmit = useCallback(async (formData) => {
    try {
      const productData = {
        ...formData,
        gstRate: parseInt(formData.gstRate),
      };

      let result;
      if (productId) {
        // For updates, we can use optimistic updates
        const originalProduct = currentProduct;
        
        // Optimistically update the product
        dispatch(optimisticUpdateProduct({
          id: productId,
          updates: productData
        }));
        
        try {
          result = await dispatch(updateProduct({ id: productId, productData })).unwrap();
        } catch (error) {
          // Revert optimistic update on failure
          if (originalProduct) {
            dispatch(revertOptimisticUpdate({
              type: 'update',
              productId,
              originalData: originalProduct
            }));
          }
          throw error;
        }
      } else {
        // For creation, use optimistic updates
        const tempProduct = {
          ...productData,
          productCode: `TEMP_${Date.now()}`,
        };
        
        // Optimistically add the product
        dispatch(optimisticCreateProduct(tempProduct));
        
        try {
          result = await dispatch(createProduct(productData)).unwrap();
        } catch (error) {
          // Revert optimistic update on failure
          dispatch(revertOptimisticUpdate({
            type: 'create',
            productId: tempProduct._id,
            originalData: null
          }));
          throw error;
        }
      }

      return result;
    } catch (error) {
      throw new Error(error || "Failed to save product");
    }
  }, [dispatch, productId, currentProduct]);

  const handleSuccess = useCallback((result) => {
    if (onSuccess) {
      onSuccess(result);
    } else {
      // Always redirect to products list page after success
      router.push("/dashboard/products");
    }
  }, [onSuccess, router]);

  const handleCancel = useCallback(() => {
    router.push("/dashboard/products");
  }, [router]);

  return (
    <Form
      title={productId ? "Edit Product" : "Add New Product"}
      fields={fields}
      initialData={initialData}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      submitText={productId ? "Update" : "Create"}
      cancelText="Cancel"
      showReset={!productId}
      resetText="Reset"
      loading={loading}
      success={
        productId
          ? "Product updated successfully!"
          : "Product created successfully!"
      }
      redirectPath="/dashboard/products"
    />
  );
});

export default ProductForm;
