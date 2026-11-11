package com.openclassrooms.etudiant.dto;

import lombok.Data;

/** Données renvoyées au client pour un étudiant. */
@Data
public class StudentResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
}
