package com.openclassrooms.etudiant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.dto.StudentResponseDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.StudentRepository;
import com.openclassrooms.etudiant.repository.UserRepository;
import com.openclassrooms.etudiant.service.StudentService;
import com.openclassrooms.etudiant.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public class StudentControllerTest {

    private static final String URL = "/api/students";
    private static final String FIRST_NAME = "John";
    private static final String LAST_NAME = "Doe";
    private static final String EMAIL = "john@doe.com";
    private static final String LOGIN = "login";
    private static final String PASSWORD = "password";

    @Container
    static MySQLContainer<?> mySQLContainer = new MySQLContainer<>("mysql:8.0");

    @Autowired
    private UserService userService;
    @Autowired
    private StudentService studentService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MockMvc mockMvc;

    private String token;

    @DynamicPropertySource
    static void configureTestProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> mySQLContainer.getJdbcUrl());
        registry.add("spring.datasource.username", () -> mySQLContainer.getUsername());
        registry.add("spring.datasource.password", () -> mySQLContainer.getPassword());
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create");
    }

    @BeforeEach
    public void beforeEach() {
        // Crée un utilisateur puis se connecte pour obtenir un token valide
        User user = new User();
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setLogin(LOGIN);
        user.setPassword(PASSWORD);
        userService.register(user);
        token = userService.login(LOGIN, PASSWORD);
    }

    @AfterEach
    public void afterEach() {
        studentRepository.deleteAll();
        userRepository.deleteAll();
    }

    private String bearer() {
        return "Bearer " + token;
    }

    @Test
    public void findAllStudents() throws Exception {
        // GIVEN :
        StudentRequestDTO studentRequestDTO = new StudentRequestDTO();
        studentRequestDTO.setFirstName(FIRST_NAME);
        studentRequestDTO.setLastName(LAST_NAME);
        studentRequestDTO.setEmail(EMAIL);
        studentService.create(studentRequestDTO);

        StudentRequestDTO studentRequestDTO1 = new StudentRequestDTO();
        studentRequestDTO1.setFirstName("Jean");
        studentRequestDTO1.setLastName("Dupont");
        studentRequestDTO1.setEmail("jean@dupont.com");
        studentService.create(studentRequestDTO1);

        // WHEN :
        mockMvc.perform(MockMvcRequestBuilders.get(URL)
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.length()").value(2))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].email").value(EMAIL))
                .andExpect(MockMvcResultMatchers.jsonPath("$[1].email").value("jean@dupont.com"));
    }

    @Test
    public void findStudentById() throws Exception {
        // GIVEN
        StudentRequestDTO studentRequestDTO = new StudentRequestDTO();
        studentRequestDTO.setFirstName(FIRST_NAME);
        studentRequestDTO.setLastName(LAST_NAME);
        studentRequestDTO.setEmail(EMAIL);
        StudentResponseDTO created = studentService.create(studentRequestDTO);

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.get(URL + "/" + created.getId())
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk());
    }

    @Test
    public void addStudent() throws Exception {
        // GIVEN
        StudentRequestDTO studentRequestDTO = new StudentRequestDTO();
        studentRequestDTO.setFirstName(FIRST_NAME);
        studentRequestDTO.setLastName(LAST_NAME);
        studentRequestDTO.setEmail(EMAIL);

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.post(URL)
                        .header("Authorization", bearer())
                        .content(objectMapper.writeValueAsString(studentRequestDTO))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isCreated());
    }

    @Test
    public void updateStudentById() throws Exception {
        // GIVEN :
        StudentRequestDTO original = new StudentRequestDTO();
        original.setFirstName(FIRST_NAME);
        original.setLastName(LAST_NAME);
        original.setEmail(EMAIL);
        StudentResponseDTO created = studentService.create(original);

        StudentRequestDTO updated = new StudentRequestDTO();
        updated.setFirstName("Jean");
        updated.setLastName("Dupont");
        updated.setEmail("jean@dupont.com");

        // WHEN : PUT sur l'id réel, avec le nouveau DTO en corps
        mockMvc.perform(MockMvcRequestBuilders.put(URL + "/" + created.getId())
                        .header("Authorization", bearer())
                        .content(objectMapper.writeValueAsString(updated))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                // THEN : statut 200 et réponse avec les nouvelles valeurs
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(created.getId()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value("Jean"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.email").value("jean@dupont.com"));

        // THEN : la base a bien été modifiée (et pas un nouvel étudiant créé)
        Student inDb = studentRepository.findById(created.getId()).orElseThrow();
        assertThat(inDb.getFirstName()).isEqualTo("Jean");
        assertThat(studentRepository.count()).isEqualTo(1);
    }

    @Test
    public void deleteStudentById() throws Exception {
        // GIVEN
        StudentRequestDTO studentRequestDTO = new StudentRequestDTO();
        studentRequestDTO.setFirstName(FIRST_NAME);
        studentRequestDTO.setLastName(LAST_NAME);
        studentRequestDTO.setEmail(EMAIL);
        StudentResponseDTO created = studentService.create(studentRequestDTO);

        // WHEN
        mockMvc.perform(MockMvcRequestBuilders.delete(URL + "/" + created.getId())
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isNoContent());
    }
}
