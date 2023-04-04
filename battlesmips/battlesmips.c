// You are required to complete `battlesmips.s` such that its behaviour
// matches this program.
//
// A simplified implementation of the classic board game battleship!
// Version 1.0 (2022/10/04): Team COMP1521 <cs1521@cse.unsw.edu.au>


#include <stdio.h>

/*-- Constants --*/

// True and False constants
#define TRUE                1
#define FALSE               0
#define INVALID             -1

// Board dimensions
#define BOARD_SIZE          7

// Bomb cell types
#define EMPTY               '-'
#define HIT                 'X'
#define MISS                'O'

// Ship cell types
#define CARRIER_SYMBOL      'C'
#define BATTLESHIP_SYMBOL   'B'
#define DESTROYER_SYMBOL    'D'
#define SUBMARINE_SYMBOL    'S'
#define PATROL_BOAT_SYMBOL  'P'

// Ship lengths
#define CARRIER_LEN         5
#define BATTLESHIP_LEN      4
#define DESTROYER_LEN       3
#define SUBMARINE_LEN       3
#define PATROL_BOAT_LEN     2

// Player names
#define BLUE                'B'
#define RED                 'R'

// Direction inputs
#define UP                  'U'
#define DOWN                'D'
#define LEFT                'L'
#define RIGHT               'R'

// Winners
#define WINNER_NONE         0
#define WINNER_RED          1
#define WINNER_BLUE         2

/*-- Data types --*/

// Defines a point on a game board.
typedef struct point {
    int row;
    int col;
} point_t;

/*-- Function prototypes --*/
void initialise_boards(void);

void initialise_board(char board[BOARD_SIZE][BOARD_SIZE]);

void setup_boards(void);

void setup_board(char board[BOARD_SIZE][BOARD_SIZE],
                 char *player);

void place_ship(char board[BOARD_SIZE][BOARD_SIZE],
                int ship_len, char ship_type);

int is_coord_out_of_bounds(point_t *coord);

int is_overlapping(char board[BOARD_SIZE][BOARD_SIZE]);

void place_ship_on_board(char board[BOARD_SIZE][BOARD_SIZE],
                         char ship_type);

void play_game(void);

void play_turn(void);

int perform_hit(char their_board[BOARD_SIZE][BOARD_SIZE],
                char our_view[BOARD_SIZE][BOARD_SIZE]);

int check_player_win(char their_board[BOARD_SIZE][BOARD_SIZE],
                     char our_view[BOARD_SIZE][BOARD_SIZE]);

int check_winner(void);

void print_board(char board[BOARD_SIZE][BOARD_SIZE]);

void swap_turn(void);

int get_end_row(int start_row, char direction, int ship_len);

int get_end_col(int start_col, char direction, int ship_len);

/*-- Global variables --*/
char  blue_board[BOARD_SIZE][BOARD_SIZE];
char   red_board[BOARD_SIZE][BOARD_SIZE];
char   blue_view[BOARD_SIZE][BOARD_SIZE];
char    red_view[BOARD_SIZE][BOARD_SIZE];

char whose_turn = BLUE;

point_t target;
point_t start;
point_t end;

// The main function calls the three "phases" of the game.
int main(void) {
    initialise_boards();
    setup_boards();
    play_game();

    return 0;
}

// Initialises all boards to 2D arrays.
// The game uses 4 boards, 2 per player.
// *_board represesnts the locations of ships
//  (the bottom board in classic battleship)
// *_view represents the hits and misses on the other players ships
//  (the top board in classic battleship)
void initialise_boards(void) {
    initialise_board(blue_board);
    initialise_board(blue_view);
    initialise_board(red_board);
    initialise_board(red_view);
}

// Initialises every position of a given board to EMPTY.
void initialise_board(char board[BOARD_SIZE][BOARD_SIZE]) {
    for (int row = 0; row < BOARD_SIZE; row++) {
        for (int col = 0; col < BOARD_SIZE; col++) {
            board[row][col] = EMPTY;
        }
    }
}

// Allow both players to place their ships on their boards.
void setup_boards(void) {
    setup_board(blue_board, "BLUE");
    setup_board(red_board,  "RED");
}

// Allows a player to place their ships on their board.
// given the name of the player as a string.
void setup_board(char board[BOARD_SIZE][BOARD_SIZE],
                 char *player) {
    printf("%s, place your ships!\n", player);

    place_ship(board, CARRIER_LEN, CARRIER_SYMBOL);
    place_ship(board, BATTLESHIP_LEN, BATTLESHIP_SYMBOL);
    place_ship(board, DESTROYER_LEN, DESTROYER_SYMBOL);
    place_ship(board, SUBMARINE_LEN, SUBMARINE_SYMBOL);
    place_ship(board, PATROL_BOAT_LEN, PATROL_BOAT_SYMBOL);

    printf("%s, Your final board looks like:\n\n", player);

    print_board(board);
}

// Attempts to place a ship of a given length on a board.
// We need a position and direction of the ship (from the player).
// We check if the given position is a valid position.
// If it is a valid position, add the ship to the given board.
// If it is not a valid position, ask for another position.
void place_ship(char board[BOARD_SIZE][BOARD_SIZE],
                int ship_len, char ship_type) {
    // `for (;;)` is an infinite loop.
    // It is the same as `while (1)`.
    // The only way to stop this loop is with a `break` (see below).
    for (;;) {
        printf("Your current board:\n");
        print_board(board);

        printf("Placing ship type %c, with length %d.\n", ship_type, ship_len);

        printf("Enter starting row: ");
        scanf("%d", &start.row);

        printf("Enter starting column: ");
        scanf("%d", &start.col);

        // Check that the starting position is on the board.
        if (is_coord_out_of_bounds(&start)) {
            printf("Coordinates out of bounds. Try again.\n");
            continue;
        }

        printf("Enter direction (U, D, L, R): ");
        char direction_char;
        scanf(" %c", &direction_char);

        // Calculate the ending positions from the given direction.
        end.row = get_end_row(start.row, direction_char, ship_len);
        end.col = get_end_col(start.col, direction_char, ship_len);

        if (end.row == INVALID || end.col == INVALID) {
            printf("Invalid direction. Try again.\n");
            continue;
        }

        // Check that the ending position is on the board
        if (is_coord_out_of_bounds(&end)) {
            printf("Ship doesn't fit in this direction. Try again.\n");
            continue;
        }

        // To make adding the ship easier,
        // we want the ship to be facing either RIGHT or DOWN.

        if (start.row > end.row) {
            // The ship is facing UP -- swap rows so it is facing DOWN.
            int temp = start.row;
            start.row = end.row;
            end.row = temp;
        }

        if (start.col > end.col) {
            // The ship is facing LEFT -- swap cols so it is facing RIGHT.
            int temp = start.col;
            start.col = end.col;
            end.col = temp;
        }

        if (!is_overlapping(board)) {
            // Check that there is not already a ship on the board
            // overlapping with our ship.
            break;
        }

        printf("Ship overlaps with another ship. Try again.\n");
    }

    // Everything looks to be valid -- add the new ship.
    place_ship_on_board(board, ship_type);
}


// Checks if a coordinate is out of bounds.
int is_coord_out_of_bounds(point_t *coord) {
    if (coord->row < 0 || coord->row >= BOARD_SIZE) {
        // If the given row is before the first row
        // or after the last row, it is invalid.
        return TRUE;
    }

    if (coord->col < 0 || coord->col >= BOARD_SIZE) {
        // If the given col is before the first col
        // or after the last col, it is invalid.
        return TRUE;
    }

    // Otherwise, the coordinate is valid.
    return FALSE;
}

// Checks if a given set of coordinates is a valid placement by checking
// for overlaps with other ships.
int is_overlapping(char board[BOARD_SIZE][BOARD_SIZE]) {
    if (start.row == end.row) {
        // The ship is horizontal -- check for overlaps in the same row.
        for (int col = start.col; col <= end.col; col++) {
            if (board[start.row][col] != EMPTY) {
                return TRUE;
            }
        }
    }
    else {
        // The ship is vertical -- check for overlaps in the same column.
        for (int row = start.row; row <= end.row; row++) {
            if (board[row][start.col] != EMPTY) {
                return TRUE;
            }
        }
    }

    return FALSE;
}

// Places a ship on a board given its start and end coordinates.
void place_ship_on_board(char board[BOARD_SIZE][BOARD_SIZE],
                         char ship_type) {
    if (start.row == end.row) {
        // The ship is horizontal -- place it in the same row.
        for (int col = start.col; col <= end.col; col++) {
            board[start.row][col] = ship_type;
        }
    }
    else {
        // The ship is vertical -- place it in the same column.
        for (int row = start.row; row <= end.row; row++) {
            board[row][start.col] = ship_type;
        }
    }
}

// Wrapper function for most of the game logic.
void play_game(void) {
    int winner = WINNER_NONE;
    while (winner == WINNER_NONE) {
        play_turn();
        winner = check_winner();
    }

    if (winner == WINNER_RED) {
        printf("RED wins!\n");
    } else {
        printf("BLUE wins!\n");
    }
}

// perform the current player's turn
void play_turn(void) {
    if (whose_turn == BLUE) {
        printf("It is BLUE's turn!\n");
        print_board(blue_view);
    }
    else {
        printf("It is RED's turn!\n");
        print_board(red_view);
    }

    printf("Please enter the row for your target: ");
    scanf("%d", &target.row);

    printf("Please enter the column for your target: ");
    scanf("%d", &target.col);

    if (is_coord_out_of_bounds(&target)) {
        printf("Coordinates out of bounds. Try again.\n");
        return;
    }

    // Check if there is a ship at the target coordinates,
    // and update current player's view of the board accordingly.

    int hit_status;
    if (whose_turn == BLUE) {
        hit_status = perform_hit(red_board, blue_view);
    }
    else {
        hit_status = perform_hit(blue_board, red_view);
    }

    if (hit_status == INVALID) {
        printf("You've already hit this target. Try again.\n");
        return;
    }
    if (hit_status == HIT) {
        printf("Successful hit!\n");
        return;
    }
    printf("Miss!\n");
    swap_turn();
}

// Attempts to perform a hit on the their_board.
// Returns HIT if the target was a hit,
// MISS if it was a miss,
// and INVALID if the target was already hit.
int perform_hit(char their_board[BOARD_SIZE][BOARD_SIZE],
                char our_view[BOARD_SIZE][BOARD_SIZE]) {
    if (our_view[target.row][target.col] != EMPTY) {
        // If our view is non-empty, we've hit this target before,
        // so it's an invalid move.
        return INVALID;
    }

    if (their_board[target.row][target.col] != EMPTY) {
        // If the target is non-empty, we've hit something.
        our_view[target.row][target.col] = HIT;
        return HIT;
    }
    // Otherwise, we have a miss.
    our_view[target.row][target.col] = MISS;
    return MISS;
}

// Checks if either player has won the game.
int check_winner(void) {
    if (check_player_win(red_board, blue_view)) {
        return WINNER_BLUE;
    }
    if (check_player_win(blue_board, red_view)) {
        return WINNER_RED;
    }
    return WINNER_NONE;
}

// Checks if the provided view has won the game.
int check_player_win(char their_board[BOARD_SIZE][BOARD_SIZE],
                     char our_view[BOARD_SIZE][BOARD_SIZE]) {
    for (int row = 0; row < BOARD_SIZE; row++) {
        for (int col = 0; col < BOARD_SIZE; col++) {
            if (their_board[row][col] != EMPTY && our_view[row][col] == EMPTY) {
                // If there is a ship on their board that we haven't hit,
                // we haven't won yet.
                return FALSE;
            }
        }
    }

    return TRUE;
}

/**********************
 * PROVIDED FUNCTIONS *
 **********************/

// Prints the given board.
// This function is provided.
void print_board(char board[BOARD_SIZE][BOARD_SIZE]) {
    printf("  ");
    for (int col = 0; col < BOARD_SIZE; col++) {
        printf("%d ", col);
    }
    printf("\n");
    for (int row = 0; row < BOARD_SIZE; row++) {
        printf("%d ", row);
        for (int col = 0; col < BOARD_SIZE; col++) {
            printf("%c ", board[row][col]);
        }
        printf("\n");
    }
}

// Swaps to the next player's turn.
// This function is provided.
void swap_turn(void) {
    if (whose_turn == BLUE) {
        whose_turn = RED;
    }
    else {
        whose_turn = BLUE;
    }
}

// Gets the end row of a ship, given its start row, direction, and length.
// This function is provided.
int get_end_row(int start_row, char direction, int ship_len) {
    if (direction == 'L' || direction == 'R') {
        return start_row;
    }
    if (direction == 'U') {
        return start_row - (ship_len - 1);
    }
    if (direction == 'D') {
        return start_row + (ship_len - 1);
    }
    return INVALID;
}

// Gets the end column of a ship given its start column, direction, and length.
// This function is provided.
int get_end_col(int start_col, char direction, int ship_len) {
    if (direction == 'U' || direction == 'D') {
        return start_col;
    }
    if (direction == 'L') {
        return start_col - (ship_len - 1);
    }
    if (direction == 'R') {
        return start_col + (ship_len - 1);
    }
    return INVALID;
}
