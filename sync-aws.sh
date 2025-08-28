#!/bin/bash

# Konfiguracja
EC2_HOST="ec2-user@16.171.155.169"
LOCAL_DIR="D:/smart-edu.ai_production"
REMOTE_DIR="/home/ec2-user/smart-edu.ai"
SSH_KEY="D:/Piszemy.com.pl/client/moja-aplikacja-key-pair.pem"

# Lista plików do synchronizacji
FILES_TO_SYNC=(
"src/messages/pl.json"
"src/messages/en.json"
"src/components/OrderStatusItem.tsx"
"src/hooks/useOrderStatus.ts"
)

# Funkcja do synchronizacji pojedynczego pliku
sync_file() {
    local file=$1
    echo "Synchronizuję $file..."
    scp -i "$SSH_KEY" "$LOCAL_DIR/$file" "$EC2_HOST:$REMOTE_DIR/$file"
}

# Funkcja do synchronizacji wszystkich plików
sync_all() {
    for file in "${FILES_TO_SYNC[@]}"; do
        sync_file "$file"
    done
    echo "Synchronizacja zakończona!"
}

# Funkcja do synchronizacji pojedynczego pliku po nazwie
sync_specific() {
    local file_to_sync=$1
    if [[ " ${FILES_TO_SYNC[@]} " =~ " ${file_to_sync} " ]]; then
        sync_file "$file_to_sync"
    else
        echo "Plik $file_to_sync nie znajduje się na liście plików do synchronizacji!"
    fi
}

# Obsługa argumentów
case "$1" in
    "all")
        sync_all
        ;;
    *)
        if [ -n "$1" ]; then
            sync_specific "$1"
        else
            echo "Użycie:"
            echo "  $0 all - synchronizuje wszystkie pliki"
            echo "  $0 nazwa_pliku - synchronizuje pojedynczy plik"
        fi
        ;;
esac
