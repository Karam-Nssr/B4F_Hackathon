/*
Pseudocode:
Objective: adapt API DTO collections into stable UI-facing models.
Input: a list operation returning DTOs and a DTO-to-model mapping function.
Process: pass the optional abort signal to the source, then map each DTO.
Output: a small adapter exposing model records; source and mapping errors propagate.
*/
export interface CollectionAdapter<TModel> {
  list: (signal?: AbortSignal) => Promise<TModel[]>;
}

interface CollectionAdapterConfig<TDto, TModel> {
  list: (signal?: AbortSignal) => Promise<TDto[]>;
  toModel: (dto: TDto) => TModel;
}

const createCollectionAdapter = <TDto, TModel>({
  list,
  toModel,
}: CollectionAdapterConfig<TDto, TModel>): CollectionAdapter<TModel> => ({
  list: async (signal) => (await list(signal)).map(toModel),
});

export default createCollectionAdapter;
