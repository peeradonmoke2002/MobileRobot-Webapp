export const ZoomPanEvent = (viewer,gridClient) => {

    const zoomView = new window.ROS2D.ZoomView({
        rootObject: viewer.scene
    })
    const panView = new window.ROS2D.PanView({
        rootObject: viewer.scene
    });

    // Setup mouse event handlers
    let mouseDown = false;
    let zoomKey = false;
    let panKey = false;
    let startPos = new window.ROSLIB.Vector3();

    const startZoom = (event) => {
      zoomKey = true;
      zoomView.startZoom(event.stageX, event.stageY);
    };
  
    const startPan = (event) => {
      panKey = true;
      panView.startPan(event.stageX, event.stageY);
    };

    const resetView = () => {

      viewer.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height);
      viewer.shift(gridClient.currentGrid.pose.position.x, gridClient.currentGrid.pose.position.y);
    
    };

    const handleKeyDown = (e) => {
      switch (e.keyCode) {
        case 67: // Key code for 'C'
          resetView();
          break;
        default:
          break;
      }
    };
  
  
    const handleMouseDown = (event) => {

      if (event.nativeEvent.ctrlKey === true || event.nativeEvent.metaKey === true) {
        startZoom(event);
      } else if (event.nativeEvent.shiftKey === true) {
        startPan(event);
      }

      startPos.x = event.stageX;
      startPos.y = event.stageY;
      mouseDown = true;
    };
  
    const handleMouseMove = (event) => {
    
      if (mouseDown === true) {
        if (zoomKey === true) {
          var dy = event.stageY - startPos.y;
          var zoom = 1 + (10 * Math.abs(dy)) / viewer.scene.canvas.clientHeight;
          if (dy < 0) zoom = 1 / zoom;
          zoomView.zoom(zoom);
        } else if (panKey === true) {
          panView.pan(event.stageX, event.stageY);
        }
      }
    };
  
    const handleMouseUp = () => {
  
      mouseDown = false;
      zoomKey = false;
      panKey = false;
    };
  
    // Add event listeners to the scene
    viewer.scene.addEventListener('stagemousedown', handleMouseDown);
    viewer.scene.addEventListener('stagemousemove', handleMouseMove);
    viewer.scene.addEventListener('stagemouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
  
    // Example: If you have separate buttons for zoom and pan
    // zoomButton.addEventListener('click', () => startZoom(event));
    // panButton.addEventListener('click', () => startPan(event));
  
    return () => {
      // Cleanup: Remove event listeners if needed
      viewer.scene.removeEventListener('stagemousedown', handleMouseDown);
      viewer.scene.removeEventListener('stagemousemove', handleMouseMove);
      viewer.scene.removeEventListener('stagemouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
}