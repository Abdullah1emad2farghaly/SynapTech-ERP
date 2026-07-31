// src/hooks/useProducts.ts
//
// Wraps services/api/products.api.ts in TanStack Query, per the established
// hooks-layer rule (components/pages import only from hooks/, never services/api/
// directly). Named `useProducts` (no `.crud` suffix / `List` suffix) since there is
// no separate lookup-only Products hook yet — no other module currently needs a
// Products dropdown, so the naming-collision problem documented for Departments/
// Branches (Section 10) does not apply here. If a future module needs a lightweight
// Products lookup, follow that same `.crud` / `List`-suffix precedent rather than
// renaming this file.
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
  UpdateProductPayload,
  type CreateProductPayload,
  type Product,
} from "../services/api/products.api";

export const productsQueryKeys = {
  all: ["products"] as const,
  list: () =>
    ["products", "list"] as const,
  detail: (id: string) => ["products", "detail", id] as const,
};

export function useProducts(): UseQueryResult<Product[]> {
  return useQuery({
    queryKey: productsQueryKeys.list(),
    queryFn: () => getProducts(),
    // placeholderData: (previousData) => previousData,
  });
}

export function useProduct(id: string | undefined): UseQueryResult<Product> {
  return useQuery({
    queryKey: productsQueryKeys.detail(id ?? ""),
    queryFn: () => getProductById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProductPayload;
    }) => updateProduct(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.all });
    },
  });
}
