package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.dto.StudentResponseDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.mapper.StudentDtoMapper;
import com.openclassrooms.etudiant.mapper.StudentDtoMapperImpl;
import com.openclassrooms.etudiant.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
public class StudentServiceTest {
    private static final String FIRST_NAME = "John";
    private static final String LAST_NAME = "Doe";
    private static final String EMAIL = "john@doe.com";
    @Mock
    private StudentRepository studentRepository;
    // Contrairement à UserService, StudentService utilise un mapper : on prend le vrai (généré par MapStruct)
    @Spy
    private StudentDtoMapper studentDtoMapper = new StudentDtoMapperImpl();
    @InjectMocks
    private StudentService studentService;

    @Test
    public void test_create_student() {
        // GIVEN
        StudentRequestDTO studentRequestDTO = new StudentRequestDTO();
        studentRequestDTO.setFirstName(FIRST_NAME);
        studentRequestDTO.setLastName(LAST_NAME);
        studentRequestDTO.setEmail(EMAIL);
        when(studentRepository.existsByEmail(any())).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        StudentResponseDTO studentResponseDTO = studentService.create(studentRequestDTO);

        // THEN
        ArgumentCaptor<Student> studentCaptor = ArgumentCaptor.forClass(Student.class);
        verify(studentRepository).save(studentCaptor.capture());

        // L'entité envoyée au repository doit contenir les données du DTO
        Student expectedStudent = new Student();
        expectedStudent.setFirstName(FIRST_NAME);
        expectedStudent.setLastName(LAST_NAME);
        expectedStudent.setEmail(EMAIL);
        assertThat(studentCaptor.getValue()).isEqualTo(expectedStudent);

        // Le DTO renvoyé doit contenir les mêmes données
        assertThat(studentResponseDTO.getFirstName()).isEqualTo(FIRST_NAME);
        assertThat(studentResponseDTO.getLastName()).isEqualTo(LAST_NAME);
        assertThat(studentResponseDTO.getEmail()).isEqualTo(EMAIL);

        // Preuve affichée dans le terminal
        System.out.println("===== PREUVE test_create_student =====");
        System.out.println("DTO reçu par le service    : " + studentRequestDTO);
        System.out.println("Entité envoyée au repository : " + studentCaptor.getValue());
        System.out.println("DTO renvoyé par le service   : " + studentResponseDTO);
        System.out.println("save() appelé 1 fois         : OK");
        System.out.println("===== TEST REUSSI =====");
    }

    @Test
    public void test_find_all_student() {
        // GIVEN : deux étudiants présents en "base" (le repository simulé les renvoie)
        Student student1 = new Student();
        student1.setFirstName(FIRST_NAME);
        student1.setLastName(LAST_NAME);
        student1.setEmail(EMAIL);
        Student student2 = new Student();
        student2.setFirstName("Jean");
        student2.setLastName("Dupont");
        student2.setEmail("jean@dupont.com");
        when(studentRepository.findAll()).thenReturn(List.of(student1, student2));

        // WHEN
        List<StudentResponseDTO> studentResponseDTOs = studentService.findAll();

        // THEN
        verify(studentRepository).findAll();
        assertThat(studentResponseDTOs).hasSize(2);
        assertThat(studentResponseDTOs.get(0).getFirstName()).isEqualTo(FIRST_NAME);
        assertThat(studentResponseDTOs.get(0).getEmail()).isEqualTo(EMAIL);
        assertThat(studentResponseDTOs.get(1).getFirstName()).isEqualTo("Jean");
        assertThat(studentResponseDTOs.get(1).getEmail()).isEqualTo("jean@dupont.com");

        // Preuve affichée dans le terminal
        System.out.println("===== PREUVE test_find_all_student =====");
        System.out.println("Entités renvoyées par le repository : " + List.of(student1, student2));
        System.out.println("DTO renvoyés par le service         : " + studentResponseDTOs);
        System.out.println("Nombre d'étudiants                  : " + studentResponseDTOs.size());
        System.out.println("findAll() appelé 1 fois             : OK");
        System.out.println("===== TEST REUSSI =====");
    }

    @Test
    public void test_find_by_id() {
        // GIVEN : un étudiant existant en "base" avec l'id 1
        Student student = new Student();
        student.setId(1L);
        student.setFirstName(FIRST_NAME);
        student.setLastName(LAST_NAME);
        student.setEmail(EMAIL);
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        // WHEN
        StudentResponseDTO studentResponseDTO = studentService.findById(1L);

        // THEN
        verify(studentRepository).findById(1L);
        assertThat(studentResponseDTO.getId()).isEqualTo(1L);
        assertThat(studentResponseDTO.getFirstName()).isEqualTo(FIRST_NAME);
        assertThat(studentResponseDTO.getLastName()).isEqualTo(LAST_NAME);
        assertThat(studentResponseDTO.getEmail()).isEqualTo(EMAIL);

        // Preuve affichée dans le terminal
        System.out.println("===== PREUVE test_find_by_id =====");
        System.out.println("Entité renvoyée par le repository : " + student);
        System.out.println("DTO renvoyé par le service        : " + studentResponseDTO);
        System.out.println("findById(1) appelé 1 fois         : OK");
        System.out.println("===== TEST REUSSI =====");
    }

    @Test
    public void test_update_student() {
        // GIVEN : un étudiant existant (id 1) et les nouvelles valeurs à appliquer
        Student student = new Student();
        student.setId(1L);
        student.setFirstName(FIRST_NAME);
        student.setLastName(LAST_NAME);
        student.setEmail(EMAIL);

        StudentRequestDTO studentRequestDTO = new StudentRequestDTO();
        studentRequestDTO.setFirstName("Jean");
        studentRequestDTO.setLastName("Dupont");
        studentRequestDTO.setEmail("jean@dupont.com");

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(studentRepository.existsByEmailAndIdNot(any(), any())).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        StudentResponseDTO studentResponseDTO = studentService.update(1L, studentRequestDTO);

        // THEN : l'entité sauvegardée porte les nouvelles valeurs et garde son id
        ArgumentCaptor<Student> studentCaptor = ArgumentCaptor.forClass(Student.class);
        verify(studentRepository).save(studentCaptor.capture());
        assertThat(studentCaptor.getValue().getId()).isEqualTo(1L);
        assertThat(studentCaptor.getValue().getFirstName()).isEqualTo("Jean");
        assertThat(studentCaptor.getValue().getLastName()).isEqualTo("Dupont");
        assertThat(studentCaptor.getValue().getEmail()).isEqualTo("jean@dupont.com");

        // Le DTO renvoyé contient les nouvelles valeurs
        assertThat(studentResponseDTO.getId()).isEqualTo(1L);
        assertThat(studentResponseDTO.getFirstName()).isEqualTo("Jean");
        assertThat(studentResponseDTO.getLastName()).isEqualTo("Dupont");
        assertThat(studentResponseDTO.getEmail()).isEqualTo("jean@dupont.com");

        // Preuve affichée dans le terminal
        System.out.println("===== PREUVE test_update_student =====");
        System.out.println("DTO reçu par le service      : " + studentRequestDTO);
        System.out.println("Entité sauvegardée           : " + studentCaptor.getValue());
        System.out.println("DTO renvoyé par le service   : " + studentResponseDTO);
        System.out.println("save() appelé 1 fois         : OK");
        System.out.println("===== TEST REUSSI =====");
    }

    @Test
    public void test_delete_student() {
        // GIVEN : un étudiant existant (id 1)
        Student student = new Student();
        student.setId(1L);
        student.setFirstName(FIRST_NAME);
        student.setLastName(LAST_NAME);
        student.setEmail(EMAIL);
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        // WHEN
        studentService.delete(1L);

        // THEN : le service a cherché l'étudiant puis demandé sa suppression
        verify(studentRepository).findById(1L);
        verify(studentRepository).delete(student);

        // Preuve affichée dans le terminal
        System.out.println("===== PREUVE test_delete_student =====");
        System.out.println("Étudiant trouvé puis supprimé : " + student);
        System.out.println("findById(1) appelé 1 fois     : OK");
        System.out.println("delete(student) appelé 1 fois : OK");
        System.out.println("===== TEST REUSSI =====");
    }
}
