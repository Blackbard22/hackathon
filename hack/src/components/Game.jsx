import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavFooter from './NavFooter';
import './Game.css';
import portrait from '../assets/portrait.jpg';

function Game() {
  const [photos, setPhotos] = useState([]);
  const [puzzle, setPuzzle] = useState([]);
  const [piecesInTray, setPiecesInTray] = useState([]);
  const [piecesOnBoard, setPiecesOnBoard] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [time, setTime] = useState(0);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [isDraggingOverTray, setIsDraggingOverTray] = useState(false);
  const [dragStartLocation, setDragStartLocation] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);
  const trayRef = useRef(null);
  const navigate = useNavigate();
  
  // Load photos on component mount
  useEffect(() => {
    let savedPhotos = JSON.parse(localStorage.getItem('lovedOnesPhotos')) || [];
    
    // If no photos found, provide default sample photos
    if (savedPhotos.length === 0) {
      const samplePhotos = [
        {
          id: 'sample1',
          name: 'Portrait 1',
          url: portrait,
          date: new Date().toISOString()
        }
       
      ];
      
      savedPhotos = samplePhotos;
      localStorage.setItem('lovedOnesPhotos', JSON.stringify(samplePhotos));
    }
    
    setPhotos(savedPhotos);

    // Choose a random photo for the puzzle
    const randomPhoto = savedPhotos[Math.floor(Math.random() * savedPhotos.length)];
    preparePuzzle(randomPhoto);
  }, [navigate]);

  // Timer logic
  useEffect(() => {
    if (gameStarted && !gameCompleted) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, gameCompleted]);

  // Check if puzzle is solved
  useEffect(() => {
    if (gameStarted && piecesOnBoard.length === puzzle.length && puzzle.length > 0) {
      const isComplete = puzzle.every(piece => {
        const placedPiece = piecesOnBoard.find(p => p.position === piece.position);
        return placedPiece && placedPiece.id === piece.id;
      });

      if (isComplete) {
        setGameCompleted(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        // Save metrics
        saveGameMetrics();
      }
    }
  }, [piecesOnBoard, puzzle, gameStarted]);

  const preparePuzzle = (photo) => {
    // Create a 3x3 puzzle grid
    const grid = 3;
    const puzzlePieces = [];
    
    for (let row = 0; row < grid; row++) {
      for (let col = 0; col < grid; col++) {
        puzzlePieces.push({
          id: `${row}-${col}`,
          position: row * grid + col,
          photo: photo.url,
          row,
          col,
          gridSize: grid,
          uniqueId: `${row}-${col}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        });
      }
    }
    
    setPuzzle([...puzzlePieces]);
    
    // Create a shuffled version for the tray
    const shuffled = [...puzzlePieces];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setPiecesInTray(shuffled);
    setPiecesOnBoard([]);
  };

  // Photo Gallery Functions
  const openGalleryModal = () => {
    setShowGalleryModal(true);
    setSelectedPhoto(null);
  };

  const closeGalleryModal = () => {
    setShowGalleryModal(false);
    setSelectedPhoto(null);
  };

  const selectPhoto = (photo) => {
    setSelectedPhoto(photo);
  };

  const useSelectedPhoto = () => {
    if (selectedPhoto) {
      preparePuzzle(selectedPhoto);
      closeGalleryModal();
    }
  };

  const deletePhoto = (photoId) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    setPhotos(updatedPhotos);
    localStorage.setItem('lovedOnesPhotos', JSON.stringify(updatedPhotos));
    
    if (updatedPhotos.length > 0) {
      // If the deleted photo was the selected photo, clear the selection
      if (selectedPhoto && selectedPhoto.id === photoId) {
        setSelectedPhoto(null);
      }
    }
  };

  // Upload Modal Functions
  const openUploadModal = () => {
    setShowUploadModal(true);
    setUploadedImage(null);
    setPhotoName('');
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadedImage(null);
    setPhotoName('');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
      // Set default name from file name without extension
      if (!photoName) {
        const fileName = file.name.split('.')[0];
        setPhotoName(fileName);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoNameChange = (e) => {
    setPhotoName(e.target.value);
  };

  const savePhoto = () => {
    if (!uploadedImage || !photoName.trim()) return;

    const newPhoto = {
      id: `photo-${Date.now()}`,
      name: photoName.trim(),
      url: uploadedImage,
      date: new Date().toISOString()
    };

    const updatedPhotos = [...photos, newPhoto];
    setPhotos(updatedPhotos);
    localStorage.setItem('lovedOnesPhotos', JSON.stringify(updatedPhotos));
    
    // Use the newly uploaded photo for the puzzle
    preparePuzzle(newPhoto);
    closeUploadModal();
  };

  const startGame = () => {
    if (photos.length === 0) {
      // Don't start the game if there are no photos
      return;
    }
    setGameStarted(true);
    setTime(0);
    setMoves(0);
  };
  
  const handleDragStart = (piece, source) => {
    setDraggedPiece({...piece, source});
    setDragStartLocation({ piece, source });
  };
  
  const handleDragOver = (e, position) => {
    e.preventDefault();
    
    // Add visual feedback when dragging over tray
    if (position === 'tray' && draggedPiece?.source === 'board') {
      setIsDraggingOverTray(true);
    }
  };
  
  const handleDragLeave = () => {
    setIsDraggingOverTray(false);
  };
  
  const handleDrop = (e, position) => {
    e.preventDefault();
    setIsDraggingOverTray(false);
    
    if (!draggedPiece) return;
    
    // CASE 1: Dropping from tray to board
    if (draggedPiece.source === 'tray') {
      // Check if there's already a piece at the target position
      const existingPiece = piecesOnBoard.find(p => p.position === position);
      
      if (existingPiece) {
        // Position is occupied, don't place
        return;
      } else {
        // Remove from tray
        const newTray = piecesInTray.filter(p => p.uniqueId !== draggedPiece.uniqueId);
        setPiecesInTray(newTray);
        
        // Add to board
        setPiecesOnBoard([...piecesOnBoard, {...draggedPiece, position}]);
        setMoves(moves + 1);
      }
    } 
    // CASE 2: Moving from board to tray
    else if (draggedPiece.source === 'board' && position === 'tray') {
      // Remove piece from board
      const newBoard = piecesOnBoard.filter(p => p.uniqueId !== draggedPiece.uniqueId);
      setPiecesOnBoard(newBoard);
      
      // Add to tray
      setPiecesInTray([...piecesInTray, draggedPiece]);
      setMoves(moves + 1);
    }
    // CASE 3: Moving from one board position to another
    else if (draggedPiece.source === 'board' && typeof position === 'number') {
      // Skip if same position
      if (draggedPiece.position === position) {
        return;
      }
      
      // Find the piece being dragged and the target piece (if any)
      const existingPiece = piecesOnBoard.find(p => p.position === position);
      
      // Create a new board array without the dragged piece
      let newBoard = piecesOnBoard.filter(p => p.uniqueId !== draggedPiece.uniqueId);
      
      if (existingPiece) {
        // If there's a piece at the target position, swap them
        
        // First, remove the target piece as well
        newBoard = newBoard.filter(p => p.uniqueId !== existingPiece.uniqueId);
        
        // Add both pieces back with swapped positions
        newBoard.push({
          ...draggedPiece,
          position: position
        });
        
        newBoard.push({
          ...existingPiece,
          position: draggedPiece.position
        });
      } else {
        // Just move the piece to the new position
        newBoard.push({
          ...draggedPiece,
          position: position
        });
      }
      
      setPiecesOnBoard(newBoard);
      setMoves(moves + 1);
    }
    
    // Reset drag state
    setDraggedPiece(null);
    setDragStartLocation(null);
  };
  
  // Handle the case when a drag operation ends without a drop
  const handleDragEnd = (e) => {
    setIsDraggingOverTray(false);
    
    // If the dropEffect is 'none', it means the drag ended outside a valid drop target
    if (!e.dataTransfer.dropEffect || e.dataTransfer.dropEffect === 'none') {
      // Return the piece to its original location
      if (dragStartLocation) {
        // No state changes needed, the piece stays where it was
        console.log("Drag ended outside valid target, piece returned to original position");
      }
    }
    
    // Always reset drag state to prevent pieces from disappearing
    setDraggedPiece(null);
    setDragStartLocation(null);
  };
  
  const saveGameMetrics = () => {
    const metrics = {
      date: new Date().toISOString(),
      time, // seconds
      moves,
      completed: true
    };
    
    const savedMetrics = JSON.parse(localStorage.getItem('gameMetrics')) || [];
    localStorage.setItem('gameMetrics', JSON.stringify([...savedMetrics, metrics]));
  };
  
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const goHome = () => {
    navigate('/');
  };
  
  const playAgain = () => {
    if (photos.length > 0) {
      const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
      preparePuzzle(randomPhoto);
      setGameStarted(false);
      setGameCompleted(false);
      setTime(0);
      setMoves(0);
    }
  };

  // Create empty cells for the board grid
  const renderEmptyBoard = () => {
    return puzzle.map((_, index) => {
      const piece = piecesOnBoard.find(p => p.position === index);
      
      if (piece) {
        return (
          <div 
            key={index} 
            className="puzzle-cell"
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div 
              className="puzzle-piece placed"
              draggable
              onDragStart={() => handleDragStart(piece, 'board')}
              onDragEnd={handleDragEnd}
              style={{
                backgroundImage: `url(${piece.photo})`,
                backgroundSize: `${piece.gridSize * 100}%`,
                backgroundPosition: `${piece.col * -100}% ${piece.row * -100}%`
              }}
            />
          </div>
        );
      }
      
      return (
        <div 
          key={index} 
          className="puzzle-cell empty"
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
        />
      );
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="game-container">
      {!gameStarted ? (
        <div className="game-intro">
          <h1>Memory Puzzle Game</h1>
          
          <div className="game-intro-content">
            <div className="game-info">
              <h2>How to Play</h2>
              <p>Drag and drop the puzzle pieces to recreate the original image.</p>
              <p>You can drag pieces back to the tray if you need to rearrange them.</p>
              <p>Pieces can be swapped by dragging one piece onto another.</p>
              
              <div className="button-group">
                {photos.length > 0 ? (
                  <button className="start-button" onClick={startGame}>Start Game</button>
                ) : (
                  <div className="no-photos-message">
                    <p>Please upload a photo to start playing</p>
                  </div>
                )}
                <button className="gallery-button" onClick={openGalleryModal}>Photo Gallery</button>
                <button className="upload-button" onClick={openUploadModal}>Upload Photo</button>
                <button className="back-button" onClick={goHome}>Back to Home</button>
              </div>
            </div>
            
            <div className="preview-container">
              <h3>Preview Image</h3>
              <div className="preview-image">
                {photos.length > 0 && puzzle.length > 0 && puzzle[0].photo ? (
                  <img src={puzzle[0].photo} alt="Puzzle preview" />
                ) : (
                  <div className="no-preview">
                    <p>No photos available</p>
                    <p>Upload a photo to start playing</p>
                  </div>
                )}
              </div>
              <p>Available Photos: {photos.length}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="active-game">
          <div className="game-header">
            <div className="metrics">
              <span>Time: {formatTime(time)}</span>
              <span>Moves: {moves}</span>
            </div>
            <button className="back-button" onClick={goHome}>Exit Game</button>
          </div>
          
          {gameCompleted ? (
            <div className="completion-message">
              <h2>Puzzle Completed!</h2>
              <p>Well done! You completed the puzzle.</p>
              <p>Time: {formatTime(time)}</p>
              <p>Moves: {moves}</p>
              <button className="play-again-button" onClick={playAgain}>Play Again</button>
              <button className="back-button" onClick={goHome}>Back to Home</button>
            </div>
          ) : (
            <div className="game-play-area">
              <div className="puzzle-board">
                {renderEmptyBoard()}
              </div>
              
              <div 
                className={`pieces-tray ${isDraggingOverTray ? 'drag-over' : ''}`}
                ref={trayRef}
                onDragOver={(e) => handleDragOver(e, 'tray')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'tray')}
              >
                {piecesInTray.map((piece) => (
                  <div 
                    key={piece.uniqueId} 
                    className="tray-piece"
                    draggable
                    onDragStart={() => handleDragStart(piece, 'tray')}
                    onDragEnd={handleDragEnd}
                  >
                    <div 
                      className="piece-content"
                      style={{
                        backgroundImage: `url(${piece.photo})`,
                        backgroundSize: `${piece.gridSize * 100}%`,
                        backgroundPosition: `${piece.col * -100}% ${piece.row * -100}%`
                      }}
                    />
                  </div>
                ))}
                {piecesInTray.length === 0 && (
                  <div className="tray-instructions">
                    Drop pieces here to return them to the tray
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Photo Gallery Modal */}
      {showGalleryModal && (
        <div className="modal-overlay">
          <div className="gallery-modal">
            <h2>Photo Gallery</h2>
            
            {photos.length > 0 ? (
              <div className="gallery-content">
                <div className="photo-grid">
                  {photos.map(photo => (
                    <div 
                      key={photo.id} 
                      className={`photo-item ${selectedPhoto && selectedPhoto.id === photo.id ? 'selected' : ''}`}
                      onClick={() => selectPhoto(photo)}
                    >
                      <div className="photo-preview">
                        <img src={photo.url} alt={photo.name} />
                      </div>
                      <div className="photo-info">
                        <h4>{photo.name}</h4>
                        <p>{formatDate(photo.date)}</p>
                      </div>
                      <button 
                        className="delete-photo-button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePhoto(photo.id);
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="gallery-actions">
                  <button 
                    className="select-photo-button" 
                    onClick={useSelectedPhoto}
                    disabled={!selectedPhoto}
                  >
                    Use Selected Photo
                  </button>
                  <button className="cancel-button" onClick={closeGalleryModal}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-gallery">
                <p>No photos available. Upload some photos to get started!</p>
                <button className="upload-button" onClick={() => {
                  closeGalleryModal();
                  openUploadModal();
                }}>
                  Upload Photo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Upload Photo Modal */}
      {showUploadModal && (
        <div className="upload-modal-overlay">
          <div className="upload-modal">
            <h2>Upload Your Photo</h2>
            
            <div className="upload-content">
              <div className="file-upload-area">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileSelect} 
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                
                <button 
                  className="file-select-button"
                  onClick={() => fileInputRef.current.click()}
                >
                  Choose Photo
                </button>
                
                {uploadedImage && (
                  <div className="uploaded-preview">
                    <img src={uploadedImage} alt="Preview" />
                  </div>
                )}
              </div>
              
              <div className="photo-details">
                <div className="input-group">
                  <label htmlFor="photoName">Photo Name:</label>
                  <input 
                    type="text" 
                    id="photoName" 
                    value={photoName} 
                    onChange={handlePhotoNameChange}
                    placeholder="Enter a name for this photo"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-buttons">
              <button 
                className="save-button" 
                onClick={savePhoto}
                disabled={!uploadedImage || !photoName.trim()}
              >
                Save Photo
              </button>
              <button className="cancel-button" onClick={closeUploadModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <NavFooter activePage="game" />
    </div>
  );
}

export default Game; 