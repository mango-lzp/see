import React, { useState, Children, cloneElement, ReactElement } from 'react';
import { storage } from '../../utils';
import './draggable-container.css';

interface DraggableProps {
  id: string;
  order?: number;
}

interface DraggableContainerProps {
  onOrderChange?: (newOrder: string[]) => void;
  children: React.ReactNode;
  className?: string;
}

function DraggableContainer({
  onOrderChange,
  children,
  className = '',
}: DraggableContainerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // 获取子元素数组
  const childrenArray = Children.toArray(children) as ReactElement[];
  
  // 从子元素中提取ID列表
  const itemIds = childrenArray.map(child => child.props.current?.id || child.key);

  // 处理拖拽开始
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('index', index.toString());
    setDraggedIndex(index);
    e.currentTarget.classList.add('dragging');
  };

  // 处理拖拽结束
  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedIndex(null);
  };

  // 处理拖拽悬停
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 处理放置
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('index'));
    
    if (sourceIndex === targetIndex) return;
    
    // 创建新的ID列表副本
    const newItemIds = [...itemIds];
    const [movedItemId] = newItemIds.splice(sourceIndex, 1);
    newItemIds.splice(targetIndex, 0, movedItemId);
    
    // 调用回调函数
    if (onOrderChange) {
      onOrderChange(newItemIds);
    }
    
    // 更新每个项目的order字段
    newItemIds.forEach((id, index) => {
      if (id) {
        storage.get(id).then(item => {
          if (item) {
            storage.set(id, { ...item, order: index });
          }
        });
      }
    });
  };

  return (
    <div className={`draggable-container ${className}`}>
      {childrenArray.map((child, index) => (
        <div 
          key={child.key}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          className={`draggable-item ${draggedIndex === index ? 'dragging' : ''}`}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

export default DraggableContainer;