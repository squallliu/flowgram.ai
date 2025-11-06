/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import {
  delay,
  EntityManager,
  FlowDocument,
  FlowDocumentJSON,
  FlowNodeBaseType,
  FlowNodeEntity,
  FlowNodeFormData,
  FlowOperationBaseService,
  FormModelV2,
  inject,
  injectable,
  Playground,
} from '@flowgram.ai/fixed-layout-editor';

import { WorkflowLoadSchemaUtils } from './utils';
import { SchemaPatch, SchemaPatchData } from './type';

@injectable()
export class WorkflowLoadSchemaService {
  @inject(FlowDocument) private document: FlowDocument;

  @inject(EntityManager) private entityManager: EntityManager;

  @inject(FlowOperationBaseService) private operationService: FlowOperationBaseService;

  @inject(Playground) private playground: Playground;

  private currentSchema: FlowDocumentJSON = {
    nodes: [],
  };

  // constructor() {
  //   (window as any).WorkflowLoadSchemaService = this;
  // }

  public async load(schema: FlowDocumentJSON): Promise<void> {
    const schemaPatch: SchemaPatch = WorkflowLoadSchemaUtils.createSchemaPatch(
      this.currentSchema,
      schema
    );
    this.currentSchema = schema;
    await this.applySchemaPatch(schemaPatch);
    this.document.fromJSON(schema);
  }

  public forceLoad(schema: FlowDocumentJSON): void {
    this.currentSchema = schema;
    this.document.fromJSON(schema);
  }

  private async applySchemaPatch(schemaPatch: SchemaPatch): Promise<void> {
    await this.applyRemovePatch(schemaPatch.remove);
    await delay(300);
    await this.applyCreatePatch(schemaPatch.create);
    await this.playground.config.fitView(this.document.root.bounds.pad(30));
  }

  private async applyCreatePatch(createSchemaPatchData: SchemaPatchData[]): Promise<void> {
    const skipNodeIDs: Set<string> = new Set();
    for (const nodePatchData of createSchemaPatchData) {
      // 跳过 block 节点
      if (skipNodeIDs.has(nodePatchData.nodeID)) {
        continue;
      }
      const parentNode = this.getNode(nodePatchData.parentID);
      // 特殊处理 condition 节点
      if (parentNode?.flowNodeType === 'condition') {
        const blocksSchema = createSchemaPatchData
          .filter((item) => item.parentID === parentNode.id)
          .map((item) => {
            skipNodeIDs.add(item.nodeID);
            return item.schema;
          });
        const blocks = this.document.addInlineBlocks(parentNode, blocksSchema);
        await Promise.all(blocks.map((block) => this.createNodeMotion(block)));
        continue;
      }
      // 更新节点数据
      const isExist = Boolean(this.getNode(nodePatchData.nodeID));
      const node = this.createNode(nodePatchData);
      if (!isExist) {
        // 新增节点动画
        await this.createNodeMotion(node);
      }
    }
  }

  private createNode(patchData: SchemaPatchData): FlowNodeEntity {
    const parent = this.getNode(patchData.parentID) ?? this.document.root;
    if (parent?.flowNodeType === 'condition') {
      // 特殊处理 condition 节点
      const blocks = this.document.addInlineBlocks(parent, [patchData.schema]);
      return blocks.find((block) => block.flowNodeType === patchData.schema.type) ?? blocks[0];
    } else if (patchData.fromNodeID) {
      return this.operationService.addFromNode(patchData.fromNodeID, patchData.schema);
    } else {
      return this.document.addNode({
        ...patchData.schema,
        parent,
      });
    }
  }

  private getNode(id?: string): FlowNodeEntity | undefined {
    if (!id) {
      return undefined;
    }
    return this.document.getNode(id);
  }

  private async createNodeMotion(node: FlowNodeEntity): Promise<void> {
    // 隐藏节点
    this.setNodeStatus(node, { loading: true, className: 'node-render-before-render' });
    this.document.fireRender();
    await delay(20);
    // 展示节点动画
    this.setNodeStatus(node, { loading: true, className: 'node-render-rendered' });
    await delay(180);
    // 滚动到节点位置
    this.playground.scrollToView({
      bounds: node.bounds,
      scrollToCenter: true,
    });
    // 高亮节点边框
    this.setNodeStatus(node, { loading: true, className: 'node-render-border-transition' });
    await delay(800);
    // 移除节点边框高亮
    this.setNodeStatus(node, { loading: false, className: '' });
  }

  private async removeNodeMotion(node: FlowNodeEntity): Promise<void> {
    // 隐藏节点
    this.setNodeStatus(node, { loading: false, className: 'node-render-removed' });
    this.document.fireRender();
    await delay(300);
  }

  private async applyRemovePatch(removeNodeIDs: string[]): Promise<void> {
    await Promise.all(
      removeNodeIDs.map(async (nodeID) => {
        const node = this.entityManager.getEntityById<FlowNodeEntity>(nodeID);
        const parent = node?.parent;
        if (node) {
          await this.removeNodeMotion(node);
          node.dispose();
        }
        if (parent?.flowNodeType === FlowNodeBaseType.BLOCK && !parent.blocks.length) {
          parent.dispose();
        }
      })
    );
  }

  private setNodeStatus(
    node: FlowNodeEntity,
    status: {
      loading: boolean;
      className: string;
    }
  ): void {
    const formModel = node.getData(FlowNodeFormData)?.getFormModel<FormModelV2>();
    formModel?.setValueIn('status', status);
  }
}
