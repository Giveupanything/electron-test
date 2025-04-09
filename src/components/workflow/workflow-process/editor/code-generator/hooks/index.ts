import { ModelTypeEnum, type DefaultModel, ModelN } from '@/types/app';
import { fetchModelList, fetchDefaultModal } from '@/api/text';
import useSWR from 'swr';

export const useModelList = (type: ModelTypeEnum) => {
  const { data, mutate, isLoading } = useSWR(`/workspaces/current/models/model-types/${type}`, fetchModelList);

  return {
    data: data?.data || [],
    mutate,
    isLoading
  };
};

export const useDefaultModel = (type: ModelTypeEnum) => {
  const { data, mutate, isLoading } = useSWR(`/workspaces/current/default-model?model_type=${type}`, fetchDefaultModal);

  return {
    data: data?.data,
    mutate,
    isLoading
  };
};

export const useModelListAndDefaultModel = (type: ModelTypeEnum) => {
  const { data: modelList } = useModelList(type);
  const { data: defaultModel } = useDefaultModel(type);

  return {
    modelList,
    defaultModel
  };
};

export const useCurrentProviderAndModel = (modelList: ModelN[], defaultModel?: DefaultModel) => {
  const currentProvider = modelList.find(provider => provider.provider === defaultModel?.provider);
  const currentModel = currentProvider?.models.find(model => model.model === defaultModel?.model);

  return {
    currentProvider,
    currentModel
  };
};

export const useModelListAndDefaultModelAndCurrentProviderAndModel = (type: ModelTypeEnum) => {
  const { modelList, defaultModel } = useModelListAndDefaultModel(type);
  const { currentProvider, currentModel } = useCurrentProviderAndModel(
    modelList,
    { provider: defaultModel?.provider.provider || '', model: defaultModel?.model || '' }
  );

  return {
    modelList,
    defaultModel,
    currentProvider,
    currentModel
  };
};