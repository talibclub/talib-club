import { useRef } from 'react';

// Drag-to-scroll hook for touchpads and mouse, used by the horizontal toolbars.
export const useDragScroll = () => {
  const ref = useRef(null);

  const onMouseDown = (e) => {
    if (!ref.current) return;
    const ele = ref.current;
    ele.dataset.isDown = "true";
    ele.dataset.startX = e.pageX - ele.offsetLeft;
    ele.dataset.scrollLeft = ele.scrollLeft;
  };
  const onMouseLeave = () => { if (ref.current) ref.current.dataset.isDown = "false"; };
  const onMouseUp = () => { if (ref.current) ref.current.dataset.isDown = "false"; };
  const onMouseMove = (e) => {
    if (!ref.current || ref.current.dataset.isDown !== "true") return;
    e.preventDefault();
    const ele = ref.current;
    const x = e.pageX - ele.offsetLeft;
    const walk = (x - parseFloat(ele.dataset.startX)) * 1.5;
    ele.scrollLeft = parseFloat(ele.dataset.scrollLeft) - walk;
  };
  return { ref, onMouseDown, onMouseLeave, onMouseUp, onMouseMove };
};
