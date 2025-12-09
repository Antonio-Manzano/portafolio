<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$servidor = "localhost";
$usuario = "root";
$contraseña = "";
$bd = "ajax";

try {
    $conexion = new PDO("mysql:host=$servidor;dbname=$bd;charset=utf8", $usuario, $contraseña);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    
    switch($action) {
        case 'getAuthors':
            getAuthors($conexion);
            break;
            
        case 'getEditorials':
            getEditorials($conexion);
            break;
            
        case 'getAllBooks':
            getAllBooks($conexion);
            break;
            
        case 'getBooksByAuthor':
            $autor = isset($_GET['autor']) ? $_GET['autor'] : '';
            getBooksByAuthor($conexion, $autor);
            break;
            
        default:
            echo json_encode(['error' => 'Acción no válida']);
            break;
    }
    
} catch(PDOException $e) {
    echo json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]);
}

function getAuthors($conexion) {
    $stmt = $conexion->prepare("SELECT DISTINCT autor FROM registros ORDER BY autor");
    $stmt->execute();
    $autores = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($autores);
}

function getEditorials($conexion) {
    $stmt = $conexion->prepare("SELECT DISTINCT editorial FROM registros ORDER BY editorial");
    $stmt->execute();
    $editoriales = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($editoriales);
}

function getAllBooks($conexion) {
    $stmt = $conexion->prepare("SELECT id, titulo, autor, precio, editorial, enlace FROM registros ORDER BY titulo");
    $stmt->execute();
    $libros = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($libros);
}

function getBooksByAuthor($conexion, $autor) {
    $stmt = $conexion->prepare("SELECT id, titulo, autor, precio, editorial, enlace FROM registros WHERE autor = :autor ORDER BY titulo");
    $stmt->bindParam(':autor', $autor);
    $stmt->execute();
    $libros = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($libros);
}
?>