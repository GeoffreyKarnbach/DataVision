export interface GraphNodeDto {
  id: string;
  type: string;
  label: string;
  attributes?: string[];
  color?: string;
}

export interface GraphLinkDto {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface GraphDto {
  nodes: GraphNodeDto[];
  links: GraphLinkDto[];
}
